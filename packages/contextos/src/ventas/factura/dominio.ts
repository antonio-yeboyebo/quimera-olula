import { MetaTabla } from "@olula/componentes/index.js";
import { plugin } from "@olula/lib/dominio.ts";
import {
    cambioClienteVentaVacio,
    clienteVentaVacio,
    nuevaVentaVacia,
    ventaVacia
} from "../venta/dominio.ts";
import {
    CambioClienteFactura,
    EstadoExpedicion,
    Factura,
    NuevaFactura
} from "./diseño.ts";

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

export const descripcionEstadoExpedicion: Record<EstadoExpedicion, string> = {
    "": "Sin expedir",
    BORRADOR: "Borrador",
    EMITIDA: "Emitida",
    FIRMADA: "Firmada",
    ERROR_FIRMA: "Error de firma",
    PRE_VERIFACTU: "Pre Verifactu",
};

/** Con el plugin de expedición activo la firma es la que cierra la factura, no la emisión. */
export const conPluginExpedicion = (): boolean =>
    plugin("estado_expedicion_factura") === "activo";

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
export const metaTablaFactura: MetaTabla<Factura> = [
    {
        id: "codigo",
        cabecera: "Código",
        prioridad: "alta",
    },
    {
        id: "nombre_cliente",
        cabecera: "Cliente",
        prioridad: "alta",
        render: (f) => f.cliente.nombre_cliente,
    },
    {
        id: "fecha",
        cabecera: "Fecha",
        tipo: "fecha",
        prioridad: "alta",
    },
    {
        id: "total",
        cabecera: "Total",
        tipo: "moneda",
        prioridad: "alta",
        divisa: (factura) => factura.divisa_id,
    },
    {
        id: "nombre_agente",
        cabecera: "Agente",
        prioridad: "baja",
    },
    {
        id: "almacen_id",
        cabecera: "Almacén",
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

