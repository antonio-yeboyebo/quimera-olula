import { ConfigAlmacen } from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

/** Los valores por defecto del escritorio (factalma_general.mtd). */
export const configAlmacenPorDefecto: ConfigAlmacen = {
    impuestoId: "",
    usarIvaDefecto: false,
};

/** Usar el IVA por defecto sin haber elegido impuesto no tiene efecto: se avisa. */
export const avisoIvaDefecto = (config: ConfigAlmacen): string =>
    config.usarIvaDefecto && !config.impuestoId
        ? tAlmacen("config.eligeElIVAPor")
        : "";

/** Para qué se pide el impuesto por defecto: el alta de un artículo o una línea nueva de documento. */
export type UsoImpuestoDefecto = "articulo" | "linea";

/**
 * El impuesto por defecto de la configuración, o null si no aplica:
 * - artículo nuevo: el «I.V.A. por defecto», con o sin la casilla (articulos.qs del escritorio);
 * - línea nueva de documento: solo con «Utilizar I.V.A. por defecto» (lineas*.qs).
 */
export const impuestoDefecto = (config: ConfigAlmacen, uso: UsoImpuestoDefecto): string | null => {
    if (!config.impuestoId) return null;
    if (uso === "linea" && !config.usarIvaDefecto) return null;
    return config.impuestoId;
};

/** Pone el impuesto por defecto en el campo del modelo si aún está vacío. */
export const conImpuestoDefecto = <T extends object>(
    modelo: T,
    campo: keyof T,
    impuesto: string | null,
): T =>
    impuesto && !modelo[campo] ? { ...modelo, [campo]: impuesto } : modelo;
