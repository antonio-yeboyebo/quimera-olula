import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto, puede } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { CrearIaTareaProgramada } from "../crear/CrearIaTareaProgramada.js";
import { DetalleIaTareaProgramada } from "../detalle/DetalleIaTareaProgramada.js";
import { IaTareaProgramada } from "../diseño.js";
import { descripcionFrecuencia } from "../dominio.js";
import "./MaestroConDetalleIaTareaProgramada.css";
import { getMaquina } from "./maquina.js";
import { tComun, useTComun } from "../../i18n/index.ts";

const metaTablaIaTareaProgramada: MetaTabla<IaTareaProgramada> = [
    { id: 'nombre', get cabecera() { return tComun("tareaProgramadaIa.nombre"); } },
    {
        id: 'expresionCron',
        get cabecera() { return tComun("tareaProgramadaIa.frecuencia"); },
        render: (tarea) => descripcionFrecuencia(tarea.expresionCron),
    },
    { id: 'activo', get cabecera() { return tComun("tareaProgramadaIa.activa"); }, tipo: 'booleano' },
    { id: 'proximaEjecucion', get cabecera() { return tComun("tareaProgramadaIa.proximaEjecucion"); }, tipo: 'fechahora' },
];

/**
 * Componente principal: listado (maestro) + detalle de tareas programadas de IA.
 */
export const MaestroConDetalleIaTareaProgramada = () => {

    const t = useTComun();
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        tareas: listaActivaEntidadesInicial<IaTareaProgramada>(id, criteriaInicial),
    });

    const { estado, tareas } = ctx;

    useUrlParams(tareas.activo, tareas.criteria);

    useEffect(() => {
        emitir("recarga_solicitada", tareas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="IaTareaProgramada">
            <MaestroDetalle<IaTareaProgramada>
                Maestro={
                    <>
                        <h2>{t("tareaProgramadaIa.tareasProgramadas")}</h2>
                        <Listado<IaTareaProgramada>
                            metaTabla={metaTablaIaTareaProgramada}
                            criteria={tareas.criteria}
                            modo="tabla"
                            entidades={tareas.lista}
                            totalEntidades={tareas.total}
                            seleccionada={tareas.activo}
                            renderAcciones={() => (
                                puede("comun.ia_tarea_programada") && (
                                    <div className="maestro-botones">
                                        <QBoton onClick={() => emitir("creacion_solicitada")}>
                                            {t("tareaProgramadaIa.nuevaTarea")}
                                        </QBoton>
                                    </div>
                                )
                            )}
                            onSeleccion={(payload) => emitir("tarea_programada_ia_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleIaTareaProgramada id={tareas.activo} publicar={emitir} />}
                seleccionada={tareas.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && (
                <CrearIaTareaProgramada
                    publicar={emitir}
                />
            )}
        </div>
    );
};
