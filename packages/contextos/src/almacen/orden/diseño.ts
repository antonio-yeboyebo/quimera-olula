import { Entidad, Filtro, Modelo, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

export type TipoOrden = "ENTRADA" | "SALIDA" | "TRASPASO";

/** Cambio en el pedido de venta posterior a generar la salida. */
export type CambioPedido = "ANADIDA" | "CAMBIADA" | "BORRADA";

export interface OrdenAlmacen extends Entidad {
    id: string;
    fecha: string;
    tipo: TipoOrden;
    almacenId: string;
    almacen: string;
    abierta: boolean;
    estado: string;
    descripcion: string;
    idUbicacionOrigen: string | null;
    ubicacionOrigen: string | null;
    idCajaOrigen: string | null;
    idUbicacionDestino: string | null;
    ubicacionDestino: string | null;
    idCajaDestino: string | null;
    pasosPick: string | null;
    pasosDrop: string | null;
    lineas: LineaOrdenAlmacen[];
    lecturasCaja: LecturaCajaOrden[];
    /** Albaranes de venta generados al albaranar la orden (solo SALIDA). */
    albaranes: AlbaranGenerado[];
}

export interface LineaOrdenAlmacen extends Entidad {
    id: string;
    sku: string;
    articulo: string;
    loteId: string | null;
    porLotes: boolean;
    cantidadPrevista: number;
    cantidadReal?: number;
    idUbicacionOrigen: string | null;
    ubicacionOrigen: string | null;
    idCajaOrigen: string | null;
    cajaOrigen: string | null;
    idUbicacionDestino: string | null;
    ubicacionDestino: string | null;
    idCajaDestino: string | null;
    cajaDestino: string | null;
    idLineaPick: string | null;
    pasosPick: string | null;
    pasosDrop: string | null;
    cantidadPick?: number;
    /** Pedido de venta del que procede la línea (salidas). */
    pedidoVentaId: string | null;
    pedidoVenta: string | null;
    cliente: string | null;
    cambioPedido: CambioPedido | null;
    /** Prevista antes del primer cambio del pedido (CAMBIADA / BORRADA). */
    cantidadPedidoAnterior: number | null;
    lecturas: LecturaLineaOrden[];
}

export interface LecturaCajaOrden extends Entidad {
    id: string;
    idCaja: string;
    lpn: string;
    idUbicacionDestino: string | null;
    ubicacionDestino: string | null;
    idCajaDestino: string | null;
    cajaDestino: string | null;
    cajaCompleta: boolean;
    fechaHora: Date;
}

export interface LecturaLineaOrden {
    id: string;
    sku: string;
    loteId: string | null;
    cantidad: number;
    idUbicacionOrigen: string | null;
    ubicacionOrigen: string | null;
    idCajaOrigen: string | null;
    cajaOrigen: string | null;
    idUbicacionDestino: string | null;
    ubicacionDestino: string | null;
    idCajaDestino: string | null;
    cajaDestino: string | null;
    fechaHora: Date;
    idLecturaCaja: string | null;
}

export interface NuevaOrdenAlmacen extends Modelo {
    // fecha?: Date;
    tipoOrden: string;
    almacenId: string;
    abierta: boolean;
    pasosPick?: string | null;
    pasosDrop?: string | null;
}

export interface NuevaLineaOrdenAlmacen extends Modelo {
    sku: string;
    loteId: string | null;
    cantidadPrevista: number;
    cantidadReal?: number;
    idUbicacionOrigen: string | null;
    idCajaOrigen: string | null;
    idUbicacionDestino: string | null;
    idCajaDestino: string | null;
    pasosPick?: string | null;
    pasosDrop?: string | null;
}

export interface NuevaLecturaOrden extends Modelo {
    cantidad: number;
    sku: string;
    articulo: string;
    idLote: string | null;
    idLinea: string | null;
    cajaCompleta: boolean;
    idCajaDestino: string | null;
    idUbicacionDestino: string | null;
    idCajaOrigen: string | null;
    idUbicacionOrigen: string | null;
    fase?: 'PICK' | 'DROP' | null;
}

export interface NuevaLecturaCajaOrden extends Modelo {
    cajaId: string;
    cajaCompleta: boolean;
    idUbicacionDestino: string | null;
    idCajaDestino: string | null;
}


export interface NuevaLecturaUbicacionOrden extends Modelo {
    idUbicacion: string;
    idUbicacionDestino: string | null;
    idCajaDestino: string | null;
}


export interface ItemOrdenAlmacen extends Entidad {
    id: string;
    fecha: string;
    tipo: string;
    abierta: boolean;
    estado: string;
    descripcion: string;
    idUbicacionOrigen: string | null;
    idCajaOrigen: string | null;
    idUbicacionDestino: string | null;
    idCajaDestino: string | null;
    idResponsable: string | null;
}

export type NuevaEntradaDesdePedido = {
    pedidoCompraId: string;
    ubicacionId: string;
};

export type CambiosOrdenAlmacen = Partial<OrdenAlmacen>;
export type CambiosLineaOrdenAlmacen = Partial<LineaOrdenAlmacen>;

export type GetOrden = (id: string) => Promise<OrdenAlmacen>;
export type GetOrdenes = (filtro: Filtro, orden: Orden, paginacion?: Paginacion) => RespuestaLista<ItemOrdenAlmacen>;
export type PostOrden = (nuevaOrden: NuevaOrdenAlmacen) => Promise<string>;
export type PatchOrden = (id: string, cambios: CambiosOrdenAlmacen) => Promise<void>;
export type DeleteOrden = (id: string) => Promise<void>;
export type PostLineasOrden = (id: string, lineas: NuevaLineaOrdenAlmacen[]) => Promise<void>;
export type PatchLineaOrden = (id: string, lineaId: string, cambios: CambiosLineaOrdenAlmacen) => Promise<void>;
export type DeleteLineasOrden = (id: string, lineaIds: string[]) => Promise<void>;
export type PostEntradaDesdePedido = (nueva: NuevaEntradaDesdePedido) => Promise<string>;
export type TerminarOrden = (id: string) => Promise<void>;
export type AlbaranGenerado = {
    id: string;
    codigo: string;
    /** Agencia y nº de envío, solo si el albarán ya tiene envío por agencia. */
    agenciaEnvio?: string;
    numeroTracking?: string;
};
/** Genera los albaranes de una SALIDA PREPARADA y la termina; devuelve los albaranes generados. */
export type AlbaranarOrden = (id: string) => Promise<AlbaranGenerado[]>;

/** Línea de pedido que no cuadra con lo recogido en la salida (aviso al albaranar).
 * FALTA: el pedido pide más de lo que sale; SOBRA: la orden saca más de lo pendiente. */
export interface DiferenciaPedidoOrden {
    tipo: "FALTA" | "SOBRA";
    pedidoId: string;
    pedido: string;
    lineaPedidoId: string;
    sku: string;
    descripcion: string;
    pendientePedido: number;
    enOrden: number;
    enOtrasSalidas: number;
    diferencia: number;
}
export type GetDiferenciasPedidoOrden = (id: string) => Promise<DiferenciaPedidoOrden[]>;
export type AdquirirOrden = (id: string) => Promise<void>;
export type PostColocacion = (id: string) => Promise<string>;
export type GetReportEtiquetasOrden = (id: string) => Promise<Blob>;

/** Agencia de transporte activa en la app (plugins transporte_*). */
export interface ServicioAgenciaEnvio {
    codigo: string;
    descripcion: string;
}

export interface AgenciaEnvio {
    codigo: string;
    nombre: string;
    servicios: ServicioAgenciaEnvio[];
}

export interface NuevoEnvioAgencia extends Modelo {
    albaranId: string;
    agenciaId: string;
    servicio: string;
    bultos: number;
    kilos: number;
    fechaRecogida: Date;
    observaciones: string;
}

export type EnvioAgenciaGenerado = { albaranId: string; agenciaId: string; numeroTracking: string };

export type GetAgenciasEnvio = () => Promise<AgenciaEnvio[]>;
/** Pide a la agencia el envío de un albarán de una SALIDA terminada. */
export type PostEnvioAgencia = (ordenId: string, envio: NuevoEnvioAgencia) => Promise<EnvioAgenciaGenerado>;
/** PDF con las etiquetas del envío de un albarán. */
export type GetEtiquetaEnvio = (albaranId: string) => Promise<Blob>;
