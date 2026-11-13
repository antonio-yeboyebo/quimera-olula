/** Cómo se está cobrando en el TPV. El visor lo muestra al cliente. */
export type MetodoCobroVisor = "efectivo" | "tarjeta" | "vale" | "qr";

export interface LineaVisor {
    id: string;
    descripcion: string;
    cantidad: number;
    pvpUnitario: number;
    dtoPorcentual: number;
    total: number;
}

/** Lo que el cliente necesita ver de la venta: no viaja nada más por el canal. */
export interface VentaVisor {
    id: string;
    codigo: string;
    divisaId: string;
    lineas: LineaVisor[];
    total: number;
    pagado: number;
    pendiente: number;
}

export interface CobroVisor {
    metodo: MetodoCobroVisor;
    /** Solo en efectivo: lo que el cliente ha entregado, para enseñarle el cambio. */
    entregado?: number;
    /** Solo en QR: el enlace de pago que se pinta como código. */
    qr?: { url: string; modo: "test" | "live" };
}

export interface PagadoVisor {
    ventaId: string;
    importe: number;
    divisaId: string;
    cambio: number;
}

export interface EstadoVisor {
    venta: VentaVisor | null;
    cobro: CobroVisor | null;
    pagado: PagadoVisor | null;
}

export type MensajeVisor =
    /** Foto de la venta en el TPV; `metodo` es null cuando no se está cobrando. */
    | { tipo: "venta"; venta: VentaVisor; metodo: MetodoCobroVisor | null }
    | { tipo: "entregado"; importe: number }
    | { tipo: "qr"; url: string; modo: "test" | "live" }
    | { tipo: "pagado"; ventaId: string; importe: number; divisaId: string }
    | { tipo: "limpiar" }
    /** El visor, al abrirse, pide al TPV lo que hay en pantalla. */
    | { tipo: "solicitar_estado" }
    | { tipo: "estado"; estado: EstadoVisor };
