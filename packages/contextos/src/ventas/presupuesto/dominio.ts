import { EstadoEtiqueta } from "#/comun/diseño.ts";
import { widgetsDocumentoVenta } from "../venta/dominio.ts";
import { Presupuesto } from "./diseño.ts";
import { tVentas } from "../i18n/index.ts";

/**
 * Un presupuesto queda bloqueado a cambios solo cuando se ha pedido entero.
 *
 * No es un campo: se deriva de `estado_aprobado`, que es lo único que guarda el
 * servidor. Misma regla que en el backend.
 */
export const aprobado = (presupuesto: Presupuesto): boolean =>
    presupuesto.estado_aprobado === "TOTAL";

export const etiquetaEstadoPresupuesto = (presupuesto: Presupuesto): EstadoEtiqueta =>
    aprobado(presupuesto)
        ? { texto: tVentas("presupuesto.estado.aprobado"), tono: "completado" }
        : { texto: tVentas("presupuesto.estado.pendiente"), tono: "pendiente" };

/** Widgets por defecto del maestro de presupuestos (totales según el filtro activo), en el idioma activo. */
export const widgetsPresupuesto = () => widgetsDocumentoVenta("ventas.presupuesto", {
    plural: tVentas("presupuesto.widgets.plural"),
    total: tVentas("presupuesto.widgets.total"),
    medio: tVentas("presupuesto.widgets.medio"),
});
