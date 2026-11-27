import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    CambiosImpresora,
    DeleteImpresora,
    EstadoImpresora,
    GetEstadoImpresora,
    GetImpresora,
    GetImpresoras,
    Impresora,
    ModoSalida,
    NuevaImpresora,
    PatchImpresora,
    PostEtiquetaPruebaImpresora,
    PostImpresora,
} from "./diseño.ts";

const baseUrl = `/almacen/impresora`;

interface ImpresoraApi {
    codigo: string;
    descripcion: string;
    host: string;
    puerto: number;
    ancho_mm: number;
    alto_mm: number;
    puntos_por_mm: number;
    desplazamiento_x: number;
    modo_salida: ModoSalida;
}

type CambiosImpresoraApi = Partial<Omit<ImpresoraApi, "codigo">>;

interface EstadoImpresoraApi {
    lista: boolean;
    sin_papel: boolean;
    en_pausa: boolean;
    cabezal_abierto: boolean;
    etiquetas_en_cola: number;
}

export const impresoraDesdeApi = (api: ImpresoraApi): Impresora => ({
    id: api.codigo,
    codigo: api.codigo,
    descripcion: api.descripcion ?? "",
    host: api.host,
    puerto: api.puerto,
    anchoMm: api.ancho_mm,
    altoMm: api.alto_mm,
    puntosPorMm: api.puntos_por_mm,
    desplazamientoX: api.desplazamiento_x,
    modoSalida: api.modo_salida,
});

const nuevaImpresoraAApi = (i: NuevaImpresora): ImpresoraApi => ({
    codigo: i.codigo.trim(),
    descripcion: i.descripcion,
    host: i.host.trim(),
    puerto: i.puerto,
    ancho_mm: i.anchoMm,
    alto_mm: i.altoMm,
    puntos_por_mm: i.puntosPorMm,
    desplazamiento_x: i.desplazamientoX,
    modo_salida: i.modoSalida,
});

const cambiosImpresoraAApi = (c: CambiosImpresora): CambiosImpresoraApi => {
    const cambios: CambiosImpresoraApi = {};
    if (c.descripcion !== undefined) cambios.descripcion = c.descripcion;
    if (c.host !== undefined) cambios.host = c.host.trim();
    if (c.puerto !== undefined) cambios.puerto = c.puerto;
    if (c.anchoMm !== undefined) cambios.ancho_mm = c.anchoMm;
    if (c.altoMm !== undefined) cambios.alto_mm = c.altoMm;
    if (c.puntosPorMm !== undefined) cambios.puntos_por_mm = c.puntosPorMm;
    if (c.desplazamientoX !== undefined) cambios.desplazamiento_x = c.desplazamientoX;
    if (c.modoSalida !== undefined) cambios.modo_salida = c.modoSalida;
    return cambios;
};

const estadoDesdeApi = (api: EstadoImpresoraApi): EstadoImpresora => ({
    lista: api.lista,
    sinPapel: api.sin_papel,
    enPausa: api.en_pausa,
    cabezalAbierto: api.cabezal_abierto,
    etiquetasEnCola: api.etiquetas_en_cola,
});

export const getImpresora: GetImpresora = async (id) =>
    RestAPI.getItem<Impresora, ImpresoraApi>(`${baseUrl}/${encodeURIComponent(id)}`, impresoraDesdeApi);

/** El servidor devuelve todas (son pocas): sin filtro ni paginación. */
export const getImpresoras: GetImpresoras = async () => {
    const respuesta = await RestAPI.get<{ datos: ImpresoraApi[] }>(baseUrl);
    const datos = respuesta.datos.map(impresoraDesdeApi);
    return { datos, total: datos.length };
};

export const postImpresora: PostImpresora = async (nueva) => {
    const respuesta = await RestAPI.post<ImpresoraApi>(
        baseUrl,
        nuevaImpresoraAApi(nueva),
        "Error al crear la impresora",
    );
    return respuesta.id;
};

export const patchImpresora: PatchImpresora = async (id, cambios) => {
    await RestAPI.patch<CambiosImpresoraApi>(
        `${baseUrl}/${encodeURIComponent(id)}`,
        cambiosImpresoraAApi(cambios),
        "Error al guardar la impresora",
    );
};

export const deleteImpresora: DeleteImpresora = async (id) => {
    await RestAPI.delete(`${baseUrl}/${encodeURIComponent(id)}`, "Error al borrar la impresora");
};

export const getEstadoImpresora: GetEstadoImpresora = async (id) => {
    const respuesta = await RestAPI.get<{ datos: EstadoImpresoraApi }>(
        `${baseUrl}/${encodeURIComponent(id)}/estado`,
    );
    return estadoDesdeApi(respuesta.datos);
};

export const postEtiquetaPruebaImpresora: PostEtiquetaPruebaImpresora = async (id) => {
    await RestAPI.post(
        `${baseUrl}/${encodeURIComponent(id)}/prueba`,
        {},
        "Error al imprimir la etiqueta de prueba",
    );
};
