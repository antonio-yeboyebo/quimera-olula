import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/** Qué hace la impresora con la etiqueta al terminar. */
export type ModoSalida = "arrancar" | "cortar" | "despegar";

/**
 * Impresora de etiquetas de red (plugin impresion). El `id` es el código.
 * `desplazamientoX` (puntos) corrige que la etiqueta no vaya centrada bajo el cabezal.
 */
export interface Impresora extends Entidad {
    id: string;
    codigo: string;
    descripcion: string;
    host: string;
    puerto: number;
    anchoMm: number;
    altoMm: number;
    puntosPorMm: number;
    desplazamientoX: number;
    modoSalida: ModoSalida;
}

export interface NuevaImpresora extends Modelo {
    codigo: string;
    descripcion: string;
    host: string;
    puerto: number;
    anchoMm: number;
    altoMm: number;
    puntosPorMm: number;
    desplazamientoX: number;
    modoSalida: ModoSalida;
}

/** Todo menos el código, que es la clave. (Omit no sirve: Entidad tiene firma de índice.) */
export type CambiosImpresora = Partial<Pick<Impresora,
    "descripcion" | "host" | "puerto" | "anchoMm" | "altoMm" | "puntosPorMm" | "desplazamientoX" | "modoSalida"
>>;

/** Lo que contesta la impresora al preguntarle el estado. */
export interface EstadoImpresora {
    lista: boolean;
    sinPapel: boolean;
    enPausa: boolean;
    cabezalAbierto: boolean;
    etiquetasEnCola: number;
}

export type GetImpresora = (id: string) => Promise<Impresora>;
export type GetImpresoras = (criteria: Criteria) => RespuestaLista<Impresora>;
export type PostImpresora = (nueva: NuevaImpresora) => Promise<string>;
export type PatchImpresora = (id: string, cambios: CambiosImpresora) => Promise<void>;
export type DeleteImpresora = (id: string) => Promise<void>;
export type GetEstadoImpresora = (id: string) => Promise<EstadoImpresora>;
export type PostEtiquetaPruebaImpresora = (id: string) => Promise<void>;
