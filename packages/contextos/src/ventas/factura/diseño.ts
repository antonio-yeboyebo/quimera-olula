import { CambioAgente } from "#/ventas/comun/componentes/moleculas/CambiarAgente/diseño.ts";
import { CambioDivisa } from "#/ventas/comun/componentes/moleculas/CambiarDivisa/diseño.ts";
import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { AltaLineaVenta, CambioClienteVenta, ClienteVenta, LineaVenta, NuevaLineaVenta, Venta } from "../venta/diseño.ts";

/**
 * Estado de expedición que devuelve el servidor. "Pte. Firma" no aparece: se
 * colapsa en EMITIDA porque para la edición son el mismo caso. La cadena vacía
 * es la factura todavía no cargada.
 */
export type EstadoExpedicion =
    | ''
    | 'BORRADOR'
    | 'EMITIDA'
    | 'FIRMADA'
    | 'ERROR_FIRMA'
    | 'PRE_VERIFACTU';

export interface Factura extends Venta {
    cliente: ClienteVenta;
    estadoExpedicion: EstadoExpedicion;
    editable?: boolean;
    por_comision: number;
    lineas?: LineaFactura[];
    hora?: string;
    almacen_id?: string;
    nombre_almacen?: string;
    // automatica?: boolean;
    servicios?: boolean;
    rectificativa_id?: string | null;
}
export interface LineaFactura extends LineaVenta {
    otro_campo?: string;
}

export type NuevaFactura = {
    cliente_id?: string;
    nombre_cliente?: string;
    id_fiscal?: string;
    tipo_via?: string;
    nombre_via?: string;
    numero?: string;
    otros?: string;
    cod_postal?: string;
    ciudad?: string;
    pais_id?: string;
    apartado?: string;
    telefono?: string;
    empresa_id: string;
};;

export type CambioClienteFactura = CambioClienteVenta;

export type NuevaLineaFactura = NuevaLineaVenta;

export type GetFacturas = (filtro: Filtro, orden: Orden, paginacion: Paginacion) => RespuestaLista<Factura>;

export type GetFactura = (id: string) => Promise<Factura>;

export type GetLineasFactura = (id: string) => Promise<LineaFactura[]>;

export type GetReportFactura = (id: string) => Promise<Blob>;

export type PostFactura = (factura: NuevaFactura) => Promise<string>;

export type PostLinea = (id: string, linea: AltaLineaVenta) => Promise<string>;

export type PatchClienteFactura = (id: string, cambio: CambioClienteFactura) => Promise<void>;

export type PatchLinea = (id: string, linea: LineaFactura) => Promise<void>;

export type PatchArticuloLinea = (id: string, lineaId: string, referencia: string) => Promise<void>;

export type PatchCantidadLinea = (id: string, linea: LineaFactura, cantidad: number) => Promise<void>;

export type DeleteLinea = (id: string, lineaId: string) => Promise<void>;

export type PatchCambiarDivisa = (id: string, cambio: CambioDivisa) => Promise<void>;

export type PatchCambiarAgente = (id: string, cambio: CambioAgente) => Promise<void>;

export interface ReciboFactura extends Entidad {
    id: string;
    codigo: string;
    fecha_emision: string;
    fecha_vencimiento: string;
    estado: string;
    importe: number;
}

export type GetRecibosFactura = (facturaId: string) => Promise<ReciboFactura[]>;

/**
 * Saca la factura de borrador (o reintenta la emisión tras un error de firma).
 * La respuesta solo confirma la operación, así que hay que recargar la factura
 * para ver el nuevo estado_expedicion.
 */
export type PatchEmitirFactura = (id: string) => Promise<void>;


export type EstadoFactura = (
    'INICIAL'
    | 'ABIERTO'
    | 'BORRANDO_FACTURA'
    | 'CAMBIANDO_CLIENTE'
    | 'CAMBIANDO_DESCUENTO'
    | 'CAMBIANDO_DIVISA'
    | 'CAMBIANDO_AGENTE'
    | 'CREANDO_LINEA'
    | 'CAMBIANDO_LINEA'
    | 'BORRANDO_LINEA'
    | 'EMITIENDO_FACTURA'
);

export type EstadoMaestroFactura = (
    'INICIAL' | 'CREANDO_FACTURA'
);

export type ContextoFactura = {
    estado: EstadoFactura;
    factura: Factura;
    facturaInicial: Factura;
    lineaActiva: LineaFactura | null;
};

export type ContextoMaestroFactura = {
    estado: EstadoMaestroFactura;
    facturas: ListaActivaEntidades<Factura>;
};

export type ClienteFacturaRegistrado = {
    id: string,
}