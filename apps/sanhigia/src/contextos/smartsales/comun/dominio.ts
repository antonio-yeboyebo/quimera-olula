import {
    EstadoTarea,
    NivelAfinidad,
    NumeroTrimestre,
    Periodo,
    RangoFechas,
    Tarea,
    TipoTarea,
    Trimestre,
} from "./diseño.ts";

const MS_DIA = 24 * 60 * 60 * 1000;

const fechaLocal = (iso: string): Date => {
    const [año, mes, dia] = iso.slice(0, 10).split("-").map(Number);
    return new Date(año, mes - 1, dia);
};

export const fechaIso = (fecha: Date): string =>
    [
        fecha.getFullYear(),
        String(fecha.getMonth() + 1).padStart(2, "0"),
        String(fecha.getDate()).padStart(2, "0"),
    ].join("-");

const inicioDia = (fecha: Date): Date => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

const diasEntre = (desde: Date, hasta: Date): number =>
    Math.round((inicioDia(hasta).getTime() - inicioDia(desde).getTime()) / MS_DIA);

export const nivelAfinidad = (score: number): NivelAfinidad | null => {
    if (score >= 0.85) return "muy_alta";
    if (score >= 0.7) return "alta";
    if (score >= 0.5) return "media";
    return null;
};

export const textoNivelAfinidad: Record<NivelAfinidad, string> = {
    muy_alta: "Muy alta",
    alta: "Alta",
    media: "Media",
};

export const porcentajeAfinidad = (score: number): number => Math.round(score * 100);

export const porcentajeTiempoTranscurrido = (rango: RangoFechas, hoy: Date = new Date()): number => {
    const desde = fechaLocal(rango.desde);
    const hasta = fechaLocal(rango.hasta);
    const total = diasEntre(desde, hasta) + 1;
    if (total <= 0) return 0;

    const transcurridos = Math.min(Math.max(diasEntre(desde, hoy) + 1, 0), total);
    return (transcurridos * 100) / total;
};

export const porcentajeConseguido = (alcanzado: number, objetivo: number): number | null =>
    objetivo > 0 ? (alcanzado * 100) / objetivo : null;

export const textoTipoTarea: Record<TipoTarea, string> = {
    Llamada: "Llamada",
    Email: "Email",
    Whatsapp: "Whatsapp",
    Cita: "Visita",
};

export const tareaAtrasada = (tarea: Tarea, ahora: Date = new Date()): boolean => {
    if (tarea.completada) return false;

    const fecha = fechaLocal(tarea.fecha);
    if (!tarea.hora) return fecha < inicioDia(ahora);

    const [horas, minutos] = tarea.hora.split(":").map(Number);
    fecha.setHours(horas, minutos);
    return fecha < ahora;
};

export const estadoTarea = (tarea: Tarea, ahora: Date = new Date()): EstadoTarea | null => {
    if (tarea.enCurso) return "en_curso";
    return tareaAtrasada(tarea, ahora) ? "atrasada" : null;
};

export const trimestreDe = (fecha: Date): Trimestre => ({
    año: fecha.getFullYear(),
    numero: (Math.floor(fecha.getMonth() / 3) + 1) as NumeroTrimestre,
});

export const rangoTrimestre = ({ año, numero }: Trimestre): RangoFechas => ({
    desde: fechaIso(new Date(año, (numero - 1) * 3, 1)),
    hasta: fechaIso(new Date(año, numero * 3, 0)),
});

export const textoTrimestre = ({ año, numero }: Trimestre): string => `T${numero} ${año}`;

export const rangoPeriodo = (periodo: Periodo): RangoFechas | null => {
    if (periodo.tipo === "fechas") return { desde: periodo.desde, hasta: periodo.hasta };
    if (periodo.trimestres.length === 0) return null;

    const rangos = periodo.trimestres.map(rangoTrimestre);
    return {
        desde: rangos.map((r) => r.desde).sort()[0],
        hasta: rangos.map((r) => r.hasta).sort().reverse()[0],
    };
};

export const periodoTrimestreActual = (hoy: Date = new Date()): Periodo => ({
    tipo: "trimestres",
    trimestres: [trimestreDe(hoy)],
});
