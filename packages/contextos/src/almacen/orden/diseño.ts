import { Entidad, Filtro, Modelo, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

export type TipoOrden = "ENTRADA" | "SALIDA" | "TRASPASO";

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
    lineas: LineaOrdenAlmacen[];
    lecturasCaja: LecturaCajaOrden[];
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
export type GetReportEtiquetasOrden = (id: string) => Promise<Blob>;
