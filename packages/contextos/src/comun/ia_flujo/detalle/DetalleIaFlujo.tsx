import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarIaFlujo } from "../borrar/BorrarIaFlujo.js";
import { IaFlujo } from "../diseño.js";
import { metaIaFlujo } from "../dominio.js";
import { contextoDetalleIaFlujoInicial, guardarIaFlujo } from "./detalle.js";
import "./DetalleIaFlujo.css";
import { getMaquina } from "./maquina.js";
import { TabGeneral } from "./TabGeneral.js";
import { TabInformacion } from "./TabInformacion.js";
import { useTComun } from "../../i18n/index.ts";

/**
 * Componente detalle de un flujo de trabajo del asistente de IA.
 *
 * Recibe el ID como prop (string | undefined), no la entidad completa.
 * La máquina carga la entidad cuando cambia el ID.
 *
 * El formulario se auto-guarda (ver metaIaFlujo.editable en dominio.ts,
 * restringido por la regla "comun.ia_flujo").
 */
export const DetalleIaFlujo = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const t = useTComun();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleIaFlujoInicial,
        publicar
    );

    // Auto-guardado: se llama cuando el modelo cambia y es válido
    const autoGuardar = useCallback(
        async (iaFlujo: IaFlujo) => {
            await guardarIaFlujo(ctx, iaFlujo);
            await emitir("ia_flujo_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaIaFlujo, ctx.iaFlujo, autoGuardar);

    const { estado, iaFlujo } = ctx;

    // Recargar cuando el ID cambia (o se deselecciona con undefined)
    useEffect(() => {
        emitir("id_cambiado", id, true);
    }, [id]);

    if (!ctx.iaFlujo.id) return null;

    const titulo = (m: IaFlujo) => m.nombre;

    // Nota: se usa `emitir` (máquina local) y no la prop `publicar` (que notifica
    // al padre), porque estas acciones transicionan/actualizan el estado local.
    const accionesIaFlujo = [
        {
            texto: t("iaFlujo.guardar"),
            onClick: () => autoGuardar(formModelo.modelo),
            deshabilitado: !puede("comun.ia_flujo") || !formModelo.modificado || !formModelo.valido,
        },
        {
            texto: iaFlujo.activo ? t("iaFlujo.desactivar") : t("iaFlujo.activar"),
            onClick: () => emitir("activo_alternado_solicitado"),
            deshabilitado: !puede("comun.ia_flujo"),
        },
        {
            texto: t("iaFlujo.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("comun.ia_flujo"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.iaFlujo}
            cerrarDetalle={() => emitir("ia_flujo_deseleccionado", null, true)}
        >
            <div className="DetalleIaFlujo">
                <QuimeraAcciones acciones={accionesIaFlujo} />
                <Tabs children={[
                    <Tab label={t("iaFlujo.general")}
                        key="tab-general"
                        children={<TabGeneral form={formModelo} />}
                    />,
                    <Tab label={t("iaFlujo.informacion")}
                        key="tab-info"
                        children={<TabInformacion iaFlujo={iaFlujo} />}
                    />,
                ]} />
            </div>

            {/* Modales condicionales: se activan según el estado de la máquina */}
            {estado === "BORRANDO" && (
                <BorrarIaFlujo
                    iaFlujo={ctx.iaFlujo}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};
