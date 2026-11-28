import { MetaModelo, puede, stringNoVacio } from "@olula/lib/dominio.ts";
import { IaTareaProgramada } from "./diseño.ts";
import { tComun } from "../i18n/index.ts";

/**
 * Tarea vacía para inicialización del contexto de detalle.
 */
export const iaTareaProgramadaVacia: IaTareaProgramada = {
    id: "",
    nombre: "",
    iaFlujoId: "",
    expresionCron: "",
    activo: true,
    proximaEjecucion: new Date(0),
    usuarioId: "",
    credencialIds: [],
};

/**
 * Validación laxa: 5 campos separados por espacios, cada uno con los
 * caracteres habituales de una expresión cron (dígitos, *, /, -, ,). No
 * pretende validar rangos (p.ej. "99" en el campo de horas) — esa
 * responsabilidad es del backend (croniter) al calcular proxima_ejecucion.
 */
export const expresionCronValida = (expresion: string): boolean => {
    const campos = expresion.trim().split(/\s+/);
    return campos.length === 5 && campos.every((c) => /^[0-9*/,-]+$/.test(c));
};

/**
 * El usuario final no escribe cron a mano: elige una frecuencia en lenguaje
 * natural (ver SelectorProgramacion.tsx) y aquí se traduce a la expresión
 * cron real. `hora`/`minuto`/`diaSemana` solo aplican a 'cada_dia'/'cada_semana'.
 */
export type FrecuenciaTarea =
    | 'cada_5_min'
    | 'cada_15_min'
    | 'cada_media_hora'
    | 'cada_hora'
    | 'cada_dia'
    | 'cada_semana';

export const OPCIONES_FRECUENCIA: { valor: FrecuenciaTarea; descripcion: string }[] = [
    { valor: 'cada_5_min', get descripcion() { return tComun("tareaProgramadaIa.cada5Minutos"); } },
    { valor: 'cada_15_min', get descripcion() { return tComun("tareaProgramadaIa.cada15Minutos"); } },
    { valor: 'cada_media_hora', get descripcion() { return tComun("tareaProgramadaIa.cadaMediaHora"); } },
    { valor: 'cada_hora', get descripcion() { return tComun("tareaProgramadaIa.cadaHora"); } },
    { valor: 'cada_dia', get descripcion() { return tComun("tareaProgramadaIa.cadaDia"); } },
    { valor: 'cada_semana', get descripcion() { return tComun("tareaProgramadaIa.cadaSemana"); } },
];

// Convención cron estándar: 0 = domingo.
export const OPCIONES_DIA_SEMANA: { valor: string; descripcion: string }[] = [
    { valor: '1', get descripcion() { return tComun("tareaProgramadaIa.lunes"); } },
    { valor: '2', get descripcion() { return tComun("tareaProgramadaIa.martes"); } },
    { valor: '3', get descripcion() { return tComun("tareaProgramadaIa.miercoles"); } },
    { valor: '4', get descripcion() { return tComun("tareaProgramadaIa.jueves"); } },
    { valor: '5', get descripcion() { return tComun("tareaProgramadaIa.viernes"); } },
    { valor: '6', get descripcion() { return tComun("tareaProgramadaIa.sabado"); } },
    { valor: '0', get descripcion() { return tComun("tareaProgramadaIa.domingo"); } },
];

export interface ProgramacionTarea {
    frecuencia: FrecuenciaTarea;
    hora: number;
    minuto: number;
    diaSemana: number;
}

export const programacionVacia: ProgramacionTarea = {
    frecuencia: 'cada_dia',
    hora: 8,
    minuto: 0,
    diaSemana: 1,
};

const dosDigitos = (n: number): string => String(n).padStart(2, '0');

export const horaDiaComoTexto = (p: ProgramacionTarea): string =>
    `${dosDigitos(p.hora)}:${dosDigitos(p.minuto)}`;

export const conHoraDiaDesdeTexto = (p: ProgramacionTarea, horaTexto: string): ProgramacionTarea => {
    const [horaStr, minutoStr] = horaTexto.split(':');
    const hora = Number(horaStr);
    const minuto = Number(minutoStr);
    if (!Number.isInteger(hora) || !Number.isInteger(minuto)) return p;
    return { ...p, hora, minuto };
};

export const expresionCronDesdeProgramacion = (p: ProgramacionTarea): string => {
    switch (p.frecuencia) {
        case 'cada_5_min': return '*/5 * * * *';
        case 'cada_15_min': return '*/15 * * * *';
        case 'cada_media_hora': return '*/30 * * * *';
        case 'cada_hora': return '0 * * * *';
        case 'cada_dia': return `${p.minuto} ${p.hora} * * *`;
        case 'cada_semana': return `${p.minuto} ${p.hora} * * ${p.diaSemana}`;
    }
};

const FRECUENCIA_POR_EXPRESION_FIJA: Record<string, FrecuenciaTarea> = {
    '*/5 * * * *': 'cada_5_min',
    '*/15 * * * *': 'cada_15_min',
    '*/30 * * * *': 'cada_media_hora',
    '0 * * * *': 'cada_hora',
};

/**
 * Reconstruye la programación amigable a partir de la expresión cron
 * almacenada — para poder abrir el selector ya posicionado en la opción
 * correcta al editar una tarea existente. Si la expresión no encaja con
 * ninguna de las formas que genera este selector (p.ej. viniera de fuera),
 * cae a un valor por defecto razonable en vez de fallar.
 */
export const programacionDesdeExpresionCron = (expresion: string): ProgramacionTarea => {
    const fija = FRECUENCIA_POR_EXPRESION_FIJA[expresion.trim()];
    if (fija) {
        return { ...programacionVacia, frecuencia: fija };
    }

    const campos = expresion.trim().split(/\s+/);
    if (campos.length === 5) {
        const [minuto, hora, diaMes, mes, diaSemana] = campos;
        const minutoNum = Number(minuto);
        const horaNum = Number(hora);
        const esHoraFija = Number.isInteger(minutoNum) && Number.isInteger(horaNum);

        if (esHoraFija && diaMes === '*' && mes === '*') {
            if (diaSemana === '*') {
                return { frecuencia: 'cada_dia', hora: horaNum, minuto: minutoNum, diaSemana: programacionVacia.diaSemana };
            }
            const diaSemanaNum = Number(diaSemana);
            if (Number.isInteger(diaSemanaNum)) {
                return { frecuencia: 'cada_semana', hora: horaNum, minuto: minutoNum, diaSemana: diaSemanaNum };
            }
        }
    }

    return programacionVacia;
};

export const descripcionFrecuencia = (expresion: string): string => {
    const p = programacionDesdeExpresionCron(expresion);
    const base = OPCIONES_FRECUENCIA.find((o) => o.valor === p.frecuencia)?.descripcion ?? expresion;
    if (p.frecuencia === 'cada_dia') return tComun("tareaProgramadaIa.baseALasP", { base, p: horaDiaComoTexto(p) });
    if (p.frecuencia === 'cada_semana') {
        const dia = OPCIONES_DIA_SEMANA.find((o) => o.valor === String(p.diaSemana))?.descripcion ?? '';
        return tComun("tareaProgramadaIa.baseDiaALasP", { base, dia, p: horaDiaComoTexto(p) });
    }
    return base;
};

/**
 * Metadatos del formulario de detalle: validaciones y configuración de campos.
 * El formulario completo se deshabilita si el usuario no tiene permiso de
 * edición sobre la regla "comun.ia_tarea_programada".
 *
 * Nota: `activo` no forma parte del formulario editable — se alterna mediante
 * la acción "Activar/Desactivar" (evento de máquina), igual que en ia_flujo.
 */
export const metaIaTareaProgramada: MetaModelo<IaTareaProgramada> = {
    campos: {
        nombre: {
            requerido: true,
            validacion: (m: IaTareaProgramada) => stringNoVacio(m.nombre),
        },
        iaFlujoId: {
            requerido: true,
            validacion: (m: IaTareaProgramada) => stringNoVacio(m.iaFlujoId),
        },
        expresionCron: {
            requerido: true,
            validacion: (m: IaTareaProgramada) => expresionCronValida(m.expresionCron),
        },
    },
    editable: () => puede("comun.ia_tarea_programada"),
};
