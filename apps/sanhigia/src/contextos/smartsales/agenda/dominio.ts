import { RangoFechas, Tarea } from "../comun/diseño.ts";
import { fechaIso } from "../comun/dominio.ts";
import { BloquesProximas, VistaAgenda } from "./diseño.ts";

const sumarDias = (fecha: Date, dias: number) => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);

const lunesDe = (fecha: Date) => sumarDias(fecha, -((fecha.getDay() + 6) % 7));

export const rangoVista = (vista: VistaAgenda, referencia: Date): RangoFechas => {
    if (vista === "dia") {
        const dia = fechaIso(referencia);
        return { desde: dia, hasta: dia };
    }
    if (vista === "semana") {
        const lunes = lunesDe(referencia);
        return { desde: fechaIso(lunes), hasta: fechaIso(sumarDias(lunes, 6)) };
    }
    return {
        desde: fechaIso(new Date(referencia.getFullYear(), referencia.getMonth(), 1)),
        hasta: fechaIso(new Date(referencia.getFullYear(), referencia.getMonth() + 1, 0)),
    };
};

export const diasDeLaSemana = (referencia: Date): Date[] =>
    Array.from({ length: 7 }, (_, i) => sumarDias(lunesDe(referencia), i));

export const desplazar = (vista: VistaAgenda, referencia: Date, pasos: number): Date => {
    if (vista === "dia") return sumarDias(referencia, pasos);
    if (vista === "semana") return sumarDias(referencia, pasos * 7);
    return new Date(referencia.getFullYear(), referencia.getMonth() + pasos, 1);
};

const porMomento = (a: Tarea, b: Tarea) =>
    `${a.fecha}T${a.hora ?? ""}`.localeCompare(`${b.fecha}T${b.hora ?? ""}`);

export const agruparPorDia = (tareas: Tarea[]): [string, Tarea[]][] => {
    const grupos = new Map<string, Tarea[]>();
    [...tareas].sort(porMomento).forEach((tarea) => {
        grupos.set(tarea.fecha, [...(grupos.get(tarea.fecha) ?? []), tarea]);
    });
    return [...grupos.entries()];
};

export const bloquesProximas = (tareas: Tarea[], hoy: Date): BloquesProximas => {
    const diaHoy = fechaIso(hoy);
    const diaMañana = fechaIso(sumarDias(hoy, 1));
    const ordenadas = [...tareas].sort(porMomento);

    return {
        hoy: ordenadas.filter((t) => t.fecha === diaHoy),
        mañana: ordenadas.filter((t) => t.fecha === diaMañana),
        proximamente: ordenadas.filter((t) => t.fecha > diaMañana),
    };
};

export const rangoProximas = (hoy: Date): RangoFechas => ({
    desde: fechaIso(hoy),
    hasta: fechaIso(sumarDias(hoy, 30)),
});

const formato = (opciones: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es-ES", opciones);

export const textoFecha = (iso: string) =>
    formato({ weekday: "long", day: "numeric", month: "long" }).format(new Date(`${iso}T00:00:00`));

export const tituloVista = (vista: VistaAgenda, referencia: Date): string => {
    if (vista === "dia") return textoFecha(fechaIso(referencia));
    if (vista === "mes") return formato({ month: "long", year: "numeric" }).format(referencia);

    const { desde, hasta } = rangoVista("semana", referencia);
    const corto = formato({ day: "numeric", month: "short" });
    return `${corto.format(new Date(`${desde}T00:00:00`))} – ${corto.format(new Date(`${hasta}T00:00:00`))}`;
};
