import { tTesoreria } from "../i18n/index.ts";

/**
 * Texto visible de un estado o tipo que llega de la BD en español (`recibosprov.estado`,
 * `remesas.estado`, tipo de remesa de pago…). El valor guardado no cambia: solo se traduce
 * lo que se enseña; un valor que no conocemos sale tal cual.
 */
export const textoEstado = (estado: string | null | undefined): string => {
    switch ((estado ?? "").trim().toLowerCase()) {
        case "emitido": return tTesoreria("estados.emitido");
        case "pagado": return tTesoreria("estados.pagado");
        case "devuelto": return tTesoreria("estados.devuelto");
        case "agrupado": return tTesoreria("estados.agrupado");
        case "remesado": return tTesoreria("estados.remesado");
        case "emitida": return tTesoreria("estados.emitida");
        case "pagada": return tTesoreria("estados.pagada");
        case "recibos": return tTesoreria("estados.recibos");
        case "nóminas": return tTesoreria("estados.nominas");
        default: return estado ?? "";
    }
};
