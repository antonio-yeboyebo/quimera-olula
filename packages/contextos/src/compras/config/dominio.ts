import { tCompras } from "#/compras/i18n/index.ts";
import { ActualizarArticulosProveedor, ConfigCompras } from "./diseño.ts";

/** El valor por defecto del escritorio (facturac_general.mtd). */
export const configComprasPorDefecto: ConfigCompras = {
    actualizarArticulosProveedor: "No Actualizar",
};

/** Clave de traducción de cada valor de la columna (el valor se guarda tal cual). */
const CLAVE: Record<ActualizarArticulosProveedor, "noActualizar" | "albaranes" | "facturas"> = {
    "No Actualizar": "noActualizar",
    "Albaranes de proveedor": "albaranes",
    "Facturas de proveedor": "facturas",
};

const VALORES: ActualizarArticulosProveedor[] = ["No Actualizar", "Albaranes de proveedor", "Facturas de proveedor"];

/** Opciones del combo, con la descripción en el idioma activo. */
export const opcionesActualizarArticulosProveedor = (t = tCompras): {
    valor: ActualizarArticulosProveedor;
    descripcion: string;
}[] => VALORES.map((valor) => ({ valor, descripcion: t(`config.opciones.${CLAVE[valor]}`) }));

export const explicacionActualizarArticulosProveedor = (
    valor: ActualizarArticulosProveedor,
    t = tCompras
): string => t(`config.explicacion.${CLAVE[valor]}`);
