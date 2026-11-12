import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useContext, useEffect, useState } from "react";
import { BorrarCredencialExterna } from "../borrar/BorrarCredencialExterna.js";
import { CredencialExterna } from "../diseño.js";
import { metaCredencialExterna } from "../dominio.js";
import { ConexionStripe, iniciarOauthGoogle, probarStripe, reconectarTelegram } from "../infraestructura.js";
import { RotarCredencialExterna } from "../rotar/RotarCredencialExterna.js";
import { contextoDetalleCredencialExternaInicial, guardarCredencialExterna } from "./detalle.js";
import "./DetalleCredencialExterna.css";
import { getMaquina } from "./maquina.js";
import { TabGeneral } from "./TabGeneral.js";
import { TabInformacion } from "./TabInformacion.js";

/**
 * Componente detalle de una credencial de terceros.
 *
 * Recibe el ID como prop (string | undefined); la máquina carga la entidad
 * cuando cambia. El formulario se auto-guarda (nombre/proveedor únicamente —
 * ver metaCredencialExterna.editable, restringido por "comun.credencial_externa").
 */
export const DetalleCredencialExterna = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleCredencialExternaInicial,
        publicar
    );

    const { intentar } = useContext(ContextoError);

    const autoGuardar = useCallback(
        async (credencial: CredencialExterna) => {
            await guardarCredencialExterna(ctx, credencial);
            await emitir("credencial_externa_guardada");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaCredencialExterna, ctx.credencial, autoGuardar);

    const { estado, credencial } = ctx;

    // Resultado del último «Probar conexión» de Stripe: solo informa, no forma parte
    // de la credencial, así que vive aquí y no en la máquina.
    const [conexionStripe, setConexionStripe] = useState<ConexionStripe | null>(null);

    useEffect(() => {
        emitir("id_cambiado", id, true);
        setConexionStripe(null);
    }, [id]);

    if (!ctx.credencial.id) return null;

    const titulo = (m: CredencialExterna) => m.nombre;

    const esConectorTelegram = credencial.proveedor === "Telegram" && credencial.categoria === "conector";
    const esConectorGoogle = (
        (credencial.proveedor === "Google Drive" || credencial.proveedor === "Google Calendar")
        && credencial.categoria === "conector"
    );

    const esConectorStripe = credencial.proveedor === "Stripe" && credencial.categoria === "conector";

    const reconectar = () => intentar(() => reconectarTelegram(credencial.id));

    const probarConexionStripe = async () => {
        setConexionStripe(null);
        const resultado = await intentar(() => probarStripe(credencial.id));
        if (resultado) setConexionStripe(resultado);
    };

    // Redirección de página completa a la pantalla de consentimiento de Google — no
    // hay precedente de popup/postMessage en este módulo, y el navegador vuelve solo
    // a esta misma pantalla (?conectado=1) tras el callback público del backend.
    const conectarGoogle = async () => {
        const url = await intentar(() => iniciarOauthGoogle(credencial.id));
        if (url) window.location.href = url;
    };

    const acciones = [
        {
            texto: "Editar credencial",
            onClick: () => emitir("rotacion_solicitada"),
            deshabilitado: !puede("comun.credencial_externa"),
        },
        {
            texto: credencial.activo ? "Desactivar" : "Activar",
            onClick: () => emitir("activo_alternado_solicitado"),
            deshabilitado: !puede("comun.credencial_externa"),
        },
        // "Reconectar" repite la misma petición de alta a Telegram (setWebhook) que ya
        // se lanza sola al crear/rotar la credencial — hace falta un botón manual
        // porque esa llamada puede fallar de formas que no dependen de la credencial en
        // sí (Telegram caído, OLULA_URL cambiada...) y sin esto no habría forma de
        // reintentarla sin rotar el secreto solo para forzar el efecto.
        ...(esConectorTelegram ? [{
            texto: "Reconectar",
            onClick: reconectar,
            deshabilitado: !puede("comun.credencial_externa"),
        }] : []),
        // "Probar conexión" comprueba la cuenta con la clave del modo con el que se
        // cobra y da de alta el webhook si falta (al guardar se intenta solo, pero
        // puede fallar sin que lo veas: OLULA_URL sin configurar, Stripe caído...).
        ...(esConectorStripe ? [{
            texto: "Probar conexión",
            onClick: probarConexionStripe,
            deshabilitado: !puede("comun.credencial_externa"),
        }] : []),
        // "Conectar con Google": inicia el flujo OAuth2 real (ver comandos/comun/
        // credencial_externa/google_oauth.py) — sin tokens todavía tras el alta
        // normal (solo client_id/client_secret), hace falta este paso para que la
        // credencial quede activa y usable por las tools de Drive/Calendar.
        ...(esConectorGoogle ? [{
            texto: "Conectar con Google",
            onClick: conectarGoogle,
            deshabilitado: !puede("comun.credencial_externa"),
        }] : []),
        {
            texto: "Borrar",
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("comun.credencial_externa"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.credencial}
            cerrarDetalle={() => emitir("credencial_externa_deseleccionada", null, true)}
        >
            <div className="DetalleCredencialExterna">
                <QuimeraAcciones acciones={acciones} />
                {esConectorStripe && conexionStripe && (
                    <ResultadoConexionStripe conexion={conexionStripe} />
                )}
                <Tabs children={[
                    <Tab label="General"
                        key="tab-general"
                        children={<TabGeneral form={formModelo} />}
                    />,
                    <Tab label="Información"
                        key="tab-info"
                        children={<TabInformacion credencial={credencial} />}
                    />,
                ]} />
            </div>

            {estado === "BORRANDO" && (
                <BorrarCredencialExterna
                    credencial={ctx.credencial}
                    publicar={emitir}
                />
            )}

            {estado === "ROTANDO" && (
                <RotarCredencialExterna
                    credencial={ctx.credencial}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};

const ResultadoConexionStripe = ({ conexion }: { conexion: ConexionStripe }) => {
    const conWebhook = conexion.webhooks[conexion.modo];
    const avisos = [
        ...(conexion.modoForzado
            ? ["Este entorno no es de producción: cobra siempre en modo test."]
            : []),
        ...(conWebhook
            ? []
            : ["No hay webhook dado de alta: Olula no podrá apuntar los cobros."]),
        ...(conexion.cuenta.cobrosActivos
            ? []
            : ["La cuenta todavía no tiene los cobros activados en Stripe."]),
        ...(conexion.cuentaCobros
            ? []
            : ["Falta la cuenta donde se apuntan los cobros: los recibos pagados no se marcarán solos. Elígela en «Editar credencial»."]),
    ];
    return (
        <QAviso variante={avisos.length ? "advertencia" : "info"}>
            Conectado a <strong>{conexion.cuenta.nombre}</strong> ({conexion.cuenta.id}) en
            modo {conexion.modo}.{conWebhook ? " Webhook dado de alta." : ""}
            {avisos.map((aviso) => <div key={aviso}>{aviso}</div>)}
        </QAviso>
    );
};
