import { tLib } from "./i18n/textos.ts";
/**
 * Errores de límites del plan (SaaS). El backend los marca con un prefijo entre
 * corchetes en el texto del error:
 *   409 `[limite:usuarios] Has llegado al máximo...`
 *   402 `[solo_lectura] ...`
 *   403 `[modulo:mcp] ...`
 *   403 `El módulo X no está contratado (regla Y)` (sin prefijo)
 * Aquí solo se reconocen y se limpia el texto; la acción que se ofrece al usuario
 * (ver su suscripción, pedírselo a su administrador) la registra cada app con
 * `configurarAccionErrorLimite`. Sin registrar nada, el mensaje se muestra limpio.
 */

export type TipoErrorLimite = "limite" | "solo_lectura" | "modulo" | "modulo_no_contratado";

export interface ErrorLimite {
    tipo: TipoErrorLimite;
    /** Identificador tras los dos puntos (`usuarios`, `mcp`), si lo hay. */
    id?: string;
    /** Texto para el usuario, sin el prefijo entre corchetes. */
    mensaje: string;
}

/** Qué se le ofrece al usuario junto al mensaje: un enlace, o solo un texto. */
export interface AccionError {
    texto: string;
    /** Ruta de la app; sin ella `texto` se muestra como indicación, sin botón. */
    url?: string;
}

const PREFIJO = /^\s*\[(limite|solo_lectura|modulo)(?::([^\]\s]*))?\]\s*/;
const MODULO_NO_CONTRATADO = /^El módulo .+ no está contratado/;
const SUFIJO_REGLA = /\s*\(regla [^)]*\)\s*\.?\s*$/;

export const analizarErrorLimite = (texto?: string | null): ErrorLimite | null => {
    if (!texto) return null;
    const prefijo = PREFIJO.exec(texto);
    if (prefijo) {
        return {
            tipo: prefijo[1] as TipoErrorLimite,
            id: prefijo[2] || undefined,
            mensaje: texto.slice(prefijo[0].length).trim(),
        };
    }
    if (MODULO_NO_CONTRATADO.test(texto.trim())) {
        const limpio = texto.trim().replace(SUFIJO_REGLA, "");
        return { tipo: "modulo_no_contratado", mensaje: limpio.endsWith(".") ? limpio : `${limpio}.` };
    }
    return null;
};

/** Título del aviso según el tipo de error. */
export const tituloErrorLimite = (e: ErrorLimite): string => {
    switch (e.tipo) {
        case "limite": return tLib("gen.erroresLimite.hasLlegadoAlLimiteDeTu");
        case "solo_lectura": return tLib("gen.erroresLimite.tuEmpresaEstaEnSoloLectura");
        default: return tLib("gen.erroresLimite.moduloNoIncluidoEnTuPlan");
    }
};

type ResolutorAccionError = (error: ErrorLimite) => AccionError | null;

let resolutor: ResolutorAccionError | null = null;

export const configurarAccionErrorLimite = (r: ResolutorAccionError | null) => {
    resolutor = r;
};

export const accionErrorLimite = (error: ErrorLimite): AccionError | null =>
    resolutor ? resolutor(error) : null;
