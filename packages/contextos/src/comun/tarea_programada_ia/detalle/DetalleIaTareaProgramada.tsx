import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { QListaDocumentos } from "@olula/componentes/lista_documentos/QListaDocumentos.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarIaTareaProgramada } from "../borrar/BorrarIaTareaProgramada.js";
import { IaTareaProgramada } from "../diseño.js";
import { metaIaTareaProgramada } from "../dominio.js";
import { contextoDetalleIaTareaProgramadaInicial, guardarIaTareaProgramada } from "./detalle.js";
import "./DetalleIaTareaProgramada.css";
import { getMaquina } from "./maquina.js";
import { TabGeneral } from "./TabGeneral.js";
import { TabHistorial } from "./TabHistorial.js";
import { useTComun } from "../../i18n/index.ts";

/**
 * Componente detalle de una tarea programada de IA.
 *
 * Recibe el ID como prop (string | undefined); la máquina carga la entidad
 * cuando cambia. El formulario se auto-guarda (ver metaIaTareaProgramada.editable
 * en dominio.ts, restringido por la regla "comun.ia_tarea_programada").
 */
export const DetalleIaTareaProgramada = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const t = useTComun();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleIaTareaProgramadaInicial,
        publicar
    );

    const autoGuardar = useCallback(
        async (tarea: IaTareaProgramada) => {
            await guardarIaTareaProgramada(ctx, tarea);
            await emitir("tarea_programada_ia_guardada");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaIaTareaProgramada, ctx.tarea, autoGuardar);

    const { estado, tarea } = ctx;

    useEffect(() => {
        emitir("id_cambiado", id, true);
    }, [id]);

    if (!ctx.tarea.id) return null;

    const titulo = (m: IaTareaProgramada) => m.nombre;

    const acciones = [
        {
            texto: t("tareaProgramadaIa.guardar"),
            onClick: () => autoGuardar(formModelo.modelo),
            deshabilitado: !puede("comun.ia_tarea_programada") || !formModelo.modificado || !formModelo.valido,
        },
        {
            texto: tarea.activo ? t("tareaProgramadaIa.desactivar") : t("tareaProgramadaIa.activar"),
            onClick: () => emitir("activo_alternado_solicitado"),
            deshabilitado: !puede("comun.ia_tarea_programada"),
        },
        {
            texto: t("tareaProgramadaIa.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("comun.ia_tarea_programada"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.tarea}
            cerrarDetalle={() => emitir("tarea_programada_ia_deseleccionada", null, true)}
        >
            <div className="DetalleIaTareaProgramada">
                <QuimeraAcciones acciones={acciones} />
                <Tabs children={[
                    <Tab label={t("tareaProgramadaIa.general")}
                        key="tab-general"
                        children={<TabGeneral form={formModelo} />}
                    />,
                    <Tab label={t("tareaProgramadaIa.historial")}
                        key="tab-historial"
                        children={<TabHistorial tarea={tarea} />}
                    />,
                    <Tab label={t("tareaProgramadaIa.informes")}
                        key="tab-informes"
                        children={<QListaDocumentos vinculoTipo="ia_tarea_programada" vinculoId={tarea.id} />}
                    />,
                ]} />
            </div>

            {estado === "BORRANDO" && (
                <BorrarIaTareaProgramada
                    tarea={ctx.tarea}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};
