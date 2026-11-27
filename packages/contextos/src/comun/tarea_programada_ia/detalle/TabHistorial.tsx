import { formatearFechaHora } from "@olula/lib/dominio.js";
import { useEffect, useState } from "react";
import { EjecucionIaTareaProgramada, IaTareaProgramada } from "../diseño.js";
import { getEjecucionesIaTareaProgramada } from "../infraestructura.js";
import "./TabHistorial.css";
import { tComun, useTComun } from "../../i18n/index.ts";

interface TabHistorialProps {
    tarea: IaTareaProgramada;
}

const ETIQUETA_ESTADO: Record<EjecucionIaTareaProgramada["estado"], string> = {
    get ok() { return tComun("tareaProgramadaIa.completada"); },
    get bloqueada() { return tComun("tareaProgramadaIa.pendienteDeConfirmacion"); },
    get error() { return tComun("tareaProgramadaIa.error"); },
};

/**
 * Historial de ejecuciones de esta tarea (auditoría). Es de solo lectura y no
 * pasa por la máquina de estados del detalle — se recarga cada vez que
 * cambia la tarea mostrada.
 */
export const TabHistorial = ({ tarea }: TabHistorialProps) => {
    const t = useTComun();
    const [ejecuciones, setEjecuciones] = useState<EjecucionIaTareaProgramada[] | null>(null);

    useEffect(() => {
        setEjecuciones(null);
        // El backend ya ordena por timestamp DESC, pero se reordena aquí también
        // (defensivo, barato) para garantizar "más recientes primero" sin depender
        // de que el orden de la API se preserve en algún punto intermedio.
        getEjecucionesIaTareaProgramada(tarea.id).then((datos) => {
            setEjecuciones([...datos].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
        });
    }, [tarea.id]);

    if (ejecuciones === null) {
        return <div className="TabHistorial">{t("tareaProgramadaIa.cargando")}</div>;
    }

    if (ejecuciones.length === 0) {
        return <div className="TabHistorial">{t("tareaProgramadaIa.todaviaNoSeHaEjecutado")}</div>;
    }

    return (
        <div className="TabHistorial">
            <ul className="lista-ejecuciones">
                {ejecuciones.map((ejecucion) => (
                    <li key={ejecucion.id} className={`ejecucion estado-${ejecucion.estado}`}>
                        <div className="ejecucion-cabecera">
                            <span className="ejecucion-estado">{ETIQUETA_ESTADO[ejecucion.estado]}</span>
                            <span className="ejecucion-fecha">{formatearFechaHora(ejecucion.timestamp)}</span>
                        </div>
                        {ejecucion.resumen && (
                            <p className="ejecucion-resumen">{ejecucion.resumen}</p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};
