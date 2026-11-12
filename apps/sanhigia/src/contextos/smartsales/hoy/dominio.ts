import { Tarea } from "../comun/diseño.ts";
import { tareaAtrasada } from "../comun/dominio.ts";
import { TareasHoy } from "./diseño.ts";

const momento = (tarea: Tarea) => `${tarea.fecha}T${tarea.hora ?? "00:00"}`;

const porMomento = (a: Tarea, b: Tarea) => momento(a).localeCompare(momento(b));

export const separarTareasHoy = (tareas: Tarea[], hoy: string): TareasHoy => ({
    deHoy: tareas.filter((t) => t.fecha === hoy).sort(porMomento),
    anteriores: tareas.filter((t) => t.fecha < hoy).sort(porMomento),
});

export const contarAtrasadas = (tareas: Tarea[], ahora: Date = new Date()): number =>
    tareas.filter((tarea) => tareaAtrasada(tarea, ahora)).length;

export const saludo = (ahora: Date = new Date()): string => {
    const hora = ahora.getHours();
    if (hora < 14) return "Buenos días";
    if (hora < 21) return "Buenas tardes";
    return "Buenas noches";
};
