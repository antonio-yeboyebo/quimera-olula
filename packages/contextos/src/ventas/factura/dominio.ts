import { EstadoEtiqueta } from "#/comun/diseño.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { plugin } from "@olula/lib/dominio.ts";
import {
    cambioClienteVentaVacio,
    clienteVentaVacio,
    nuevaVentaVacia,
    ventaVacia,
    widgetsDocumentoVenta
} from "../venta/dominio.ts";
import {
    CambioClienteFactura,
    EstadoExpedicion,
    Factura,
    NuevaFactura
} from "./diseño.ts";
import { tVentas } from "../i18n/index.ts";

/**
 * Estados que puede mandar el servidor, ya normalizados (mayúsculas y guiones
 * bajos). "Pte. Firma" se colapsa en EMITIDA: una factura pendiente de firma se
 * comporta igual que una emitida.
 */
const ESTADOS_EXPEDICION: Record<string, EstadoExpedicion> = {
    BORRADOR: "BORRADOR",
    EMITIDA: "EMITIDA",
    PTE_FIRMA: "EMITIDA",
    PENDIENTE_FIRMA: "EMITIDA",
    FIRMADA: "FIRMADA",
    FIRMADO: "FIRMADA",
    ERROR_FIRMA: "ERROR_FIRMA",
    PRE_VERIFACTU: "PRE_VERIFACTU",
};

export const estadoExpedicionDesdeApi = (valor: string | null | undefined): EstadoExpedicion => {
    const clave = (valor ?? "").trim().toUpperCase().replace(/[\s.-]+/g, "_");
    return ESTADOS_EXPEDICION[clave] ?? "";
};

/** Descripción del estado de expedición en el idioma activo. */
export const descripcionEstadoExpedicion = (estado: EstadoExpedicion): string =>
    estado === "" ? tVentas("factura.estado.sinExpedir") : tVentas(`factura.estado.${estado}`);

/**
 * Variante del plugin `estado_expedicion_factura` del servidor en la que la
 * firma (Veri*Factu) es la que cierra la factura. Las otras son "basico",
 * "inactivo" y "emision" (firma con la factura emitida protegida: como en
 * "basico", solo se edita el borrador); "activo" no existe.
 */
export const VARIANTE_EXPEDICION_CON_FIRMA = "firma";

/** Con la variante de firma es la firma la que cierra la factura, no la emisión. */
export const conPluginExpedicion = (): boolean =>
    plugin("estado_expedicion_factura") === VARIANTE_EXPEDICION_CON_FIRMA;

/**
 * Sin plugin solo se edita el borrador. Con plugin una factura emitida (o con
 * error de firma) sigue siendo editable y solo la firmada queda bloqueada.
 */
export const facturaEditable = (factura: Factura): boolean => {
    if (!factura.estadoExpedicion) return false;
    if (factura.estadoExpedicion === "BORRADOR") return true;

    return conPluginExpedicion() && factura.estadoExpedicion !== "FIRMADA";
};

/**
 * Se emite el borrador y se reintenta la emisión de lo que falló al firmar; el
 * resto de estados ya están emitidos.
 */
export const facturaEmitible = (factura: Factura): boolean =>
    factura.estadoExpedicion === "BORRADOR" ||
    factura.estadoExpedicion === "ERROR_FIRMA";

/** Un reintento tras un error de firma, no una primera emisión. */
export const emisionEsReintento = (factura: Factura): boolean =>
    factura.estadoExpedicion === "ERROR_FIRMA";

// La columna de estado la añade el maestro, que es quien pinta el círculo.
export const metaTablaFactura = (): MetaTabla<Factura> => [
    {
        id: "codigo",
        estilo: "secundario",
        cabecera: tVentas("documento.maestro.codigo"),
        prioridad: "alta",
    },
    {
        id: "nombre_cliente",
        estilo: "destacado",
        cabecera: tVentas("documento.maestro.cliente"),
        prioridad: "alta",
        render: (f) => f.cliente.nombre_cliente,
    },
    {
        id: "fecha",
        cabecera: tVentas("documento.maestro.fecha"),
        tipo: "fecha",
        prioridad: "alta",
    },
    {
        id: "total",
        estilo: "destacado",
        cabecera: tVentas("documento.maestro.total"),
        tipo: "moneda",
        prioridad: "alta",
        divisa: (factura) => factura.divisa_id,
    },
    {
        id: "nombre_agente",
        cabecera: tVentas("documento.maestro.agente"),
        prioridad: "baja",
    },
    {
        id: "almacen_id",
        cabecera: tVentas("documento.maestro.almacen"),
        prioridad: "baja",
        render: (f) => f.nombre_almacen || f.almacen_id,
    },
];

export const facturaVacia = (): Factura => ({
    ...ventaVacia,
    cliente: clienteVentaVacio,
    editable: false,
    por_comision: 0,
    estadoExpedicion: "",
});

export const nuevaFacturaVacia: NuevaFactura = nuevaVentaVacia;

export const cambioClienteFacturaVacio: CambioClienteFactura = cambioClienteVentaVacio;

/**
 * Borrador en gris, error de firma en rojo. Una emitida que aún se puede tocar
 * (con el plugin de expedición, a la espera de firma) está pendiente; la que ya
 * no admite cambios está completada.
 */
export const etiquetaEstadoFactura = (factura: Factura): EstadoEtiqueta => {
    const texto = descripcionEstadoExpedicion(factura.estadoExpedicion);
    const { estadoExpedicion } = factura;

    if (estadoExpedicion === "ERROR_FIRMA") return { texto, tono: "error" };
    if (estadoExpedicion === "BORRADOR" || estadoExpedicion === "") return { texto, tono: "borrador" };
    return { texto, tono: facturaEditable(factura) ? "pendiente" : "completado" };
};

/** Widgets por defecto del maestro de facturas (totales según el filtro activo). */
export const widgetsFactura = () => widgetsDocumentoVenta("ventas.factura", {
    plural: tVentas("factura.widgets.plural"),
    total: tVentas("factura.widgets.total"),
    medio: tVentas("factura.widgets.medio"),
});
