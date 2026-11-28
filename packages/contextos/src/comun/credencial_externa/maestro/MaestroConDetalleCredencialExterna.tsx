import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto, puede } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo, useState } from "react";
import { CrearCredencialExterna } from "../crear/CrearCredencialExterna.js";
import { DetalleCredencialExterna } from "../detalle/DetalleCredencialExterna.js";
import { CredencialExterna } from "../diseño.js";
import "./MaestroConDetalleCredencialExterna.css";
import { getMaquina } from "./maquina.js";
import { RejillaCredenciales } from "./RejillaCredenciales.js";
import { useTComun } from "../../i18n/index.ts";

/**
 * Componente principal: rejillas de tiles (LLM / Conectores) + detalle de
 * credenciales de terceros. Sustituye la tabla clásica por un tile con el
 * icono del proveedor por credencial — más visual y directo para elegir
 * "qué IA/plugin configurar" que una tabla genérica.
 */
export const MaestroConDetalleCredencialExterna = () => {

    const t = useTComun();
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        credenciales: listaActivaEntidadesInicial<CredencialExterna>(id, criteriaInicial),
        categoriaCreando: "conector",
    });

    const { estado, credenciales, categoriaCreando } = ctx;

    useUrlParams(credenciales.activo, credenciales.criteria);

    useEffect(() => {
        emitir("recarga_solicitada", credenciales.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Vuelta del callback OAuth de Google (comun/credencial_externa/oauth_callback.py,
    // redirección de página completa) — ?conectado=1 / ?oauth_error=1 en la URL. Se
    // limpian de la URL tras leerlos para que un refresco no repita el aviso.
    const [avisoOauth, setAvisoOauth] = useState<"conectado" | "error" | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has("conectado")) {
            setAvisoOauth("conectado");
        } else if (params.has("oauth_error")) {
            setAvisoOauth("error");
        } else {
            return;
        }
        params.delete("conectado");
        params.delete("oauth_error");
        const resto = params.toString();
        window.history.replaceState(null, "", `${window.location.pathname}${resto ? `?${resto}` : ""}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const puedeCrear = puede("comun.credencial_externa");
    const llm = credenciales.lista.filter((c) => c.categoria === "llm");
    const conectores = credenciales.lista.filter((c) => c.categoria === "conector");

    return (
        <div className="CredencialExterna">
            {avisoOauth === "conectado" && (
                <QAviso variante="info">{t("credencialExterna.cuentaDeGoogleConectadaCorrectamente")}</QAviso>
            )}
            {avisoOauth === "error" && (
                <QAviso variante="error">
                    {t("credencialExterna.noSeHaPodidoCompletarLa")}
                </QAviso>
            )}
            <MaestroDetalle<CredencialExterna>
                Maestro={
                    <>
                        <h2>{t("credencialExterna.credenciales")}</h2>
                        <RejillaCredenciales
                            titulo={t("credencialExterna.modeloDeIa")}
                            credenciales={llm}
                            onSeleccion={(payload) => emitir("credencial_externa_seleccionada", payload)}
                            onCrear={() => emitir("creacion_solicitada", "llm")}
                            puedeCrear={puedeCrear}
                            textoCrear={t("credencialExterna.configurarLlm")}
                        />
                        <RejillaCredenciales
                            titulo={t("credencialExterna.conectores")}
                            credenciales={conectores}
                            onSeleccion={(payload) => emitir("credencial_externa_seleccionada", payload)}
                            onCrear={() => emitir("creacion_solicitada", "conector")}
                            puedeCrear={puedeCrear}
                            textoCrear={t("credencialExterna.nuevoConector")}
                        />
                    </>
                }
                Detalle={<DetalleCredencialExterna id={credenciales.activo} publicar={emitir} />}
                seleccionada={credenciales.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && (
                <CrearCredencialExterna
                    categoriaFiltro={categoriaCreando}
                    publicar={emitir}
                />
            )}
        </div>
    );
};
