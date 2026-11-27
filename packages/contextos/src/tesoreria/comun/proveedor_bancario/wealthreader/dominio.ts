import { tTesoreria } from "../../../i18n/index.ts";
export const ORIGEN_WIDGET_WEALTH_READER = "https://widget.wealthreader.com";
export const URL_SCRIPT_WEALTH_READER = `${ORIGEN_WIDGET_WEALTH_READER}/js/load.js`;

/** Lo que envía el widget por `postMessage` cuando termina. */
const MENSAJE_COMPLETADO = "flow completed";

export type MensajeWealthReader =
    | { tipo: "completado" }
    | { tipo: "error"; texto: string }
    | { tipo: "otro" };

/**
 * "flow completed" llega cuando el servidor ya ha aceptado los datos del
 * banco. Un JSON con `error` es un aviso del flujo (doble factor, login
 * incorrecto, callback caído…); el resto se ignora.
 */
export const interpretarMensajeWealthReader = (datos: unknown): MensajeWealthReader => {
    if (typeof datos !== "string") return { tipo: "otro" };
    if (datos === MENSAJE_COMPLETADO) return { tipo: "completado" };

    try {
        const mensaje = JSON.parse(datos) as { error?: { code?: unknown; message?: unknown } };
        if (!mensaje?.error) return { tipo: "otro" };
        const texto = typeof mensaje.error.message === "string" ? mensaje.error.message : tTesoreria("comun.errorDelBanco");
        return { tipo: "error", texto: mensaje.error.code ? tTesoreria("comun.textoCodigoCode", { texto, code: String(mensaje.error.code) }) : texto };
    } catch {
        return { tipo: "otro" };
    }
};
