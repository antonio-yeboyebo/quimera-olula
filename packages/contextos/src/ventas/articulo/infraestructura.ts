import { tipoCodBarrasDesdeApi } from "#/valores/codbarras.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import {
    Articulo,
    CambiosArticulo,
    GetArticulo,
    GetArticulos,
    GetTagsArticulo,
    PatchArticulo,
    PostArticulo,
    TagArticulo,
} from "./diseño.ts";
import { filtroArticulosVenta } from "./dominio.ts";
import { tVentas } from "../i18n/index.ts";

const baseUrl = `/ventas/articulo`;

interface ArticuloApi {
    id: string;
    descripcion: string;
    barcode: string | null;
    tipo_barcode: string | null;
    observaciones: string | null;
    familia_id: string | null;
    descripcion_familia: string | null;
    precio: number;
    grupo_iva_producto_id: string;
    pvp_variable: boolean;
    sin_stock: boolean;
}

interface TagArticuloApi {
    id: string;
    descripcion: string;
    precio: number;
    grupo_iva_producto_id: string;
    barcode: string | null;
    por_lotes: boolean;
}

const articuloDesdeApi = (a: ArticuloApi): Articulo => ({
    id: a.id,
    descripcion: a.descripcion,
    codbarras: a.barcode ?? "",
    tipoCodBarras: tipoCodBarrasDesdeApi(a.tipo_barcode),
    observaciones: a.observaciones ?? "",
    familiaId: a.familia_id ?? "",
    descripcionFamilia: a.descripcion_familia ?? "",
    precio: a.precio,
    grupoIvaProductoId: a.grupo_iva_producto_id,
    pvpVariable: a.pvp_variable,
    noStock: a.sin_stock,
});

const tagArticuloDesdeApi = (t: TagArticuloApi): TagArticulo => ({
    id: t.id,
    descripcion: t.descripcion,
    precio: t.precio,
    grupoIvaProductoId: t.grupo_iva_producto_id,
    codbarras: t.barcode ?? "",
    porLotes: t.por_lotes,
});

const oNulo = (valor: string): string | null => valor === "" ? null : valor;

const cambiosArticuloAApi = (cambios: CambiosArticulo): Record<string, unknown> => {
    const api: Record<string, unknown> = {};

    if (cambios.descripcion !== undefined) api.descripcion = cambios.descripcion;
    if (cambios.codbarras !== undefined) api.barcode = oNulo(cambios.codbarras);
    if (cambios.tipoCodBarras !== undefined) api.tipo_barcode = oNulo(cambios.tipoCodBarras);
    if (cambios.observaciones !== undefined) api.observaciones = oNulo(cambios.observaciones);
    if (cambios.familiaId !== undefined) api.familia_id = oNulo(cambios.familiaId);
    if (cambios.precio !== undefined) api.precio = cambios.precio;
    if (cambios.grupoIvaProductoId !== undefined) api.grupo_iva_producto_id = oNulo(cambios.grupoIvaProductoId);

    return api;
};

export const getArticulos: GetArticulos = async (filtro, orden, paginacion) => {
    const q = criteriaQuery(filtroArticulosVenta(filtro), orden, paginacion);
    return RestAPI.get<{ datos: ArticuloApi[] }>(`${baseUrl}${q}`).then(
        (respuesta) => respuesta.datos.map(articuloDesdeApi)
    );
};

export const getArticulo: GetArticulo = async (id) =>
    RestAPI.get<{ datos: ArticuloApi }>(`${baseUrl}/${id}`).then(
        (respuesta) => articuloDesdeApi(respuesta.datos)
    );

export const getTagsArticulo: GetTagsArticulo = async (filtro, orden) => {
    const q = criteriaQuery(filtro, orden);
    return RestAPI.get<{ datos: TagArticuloApi[] }>(`${baseUrl}/tags${q}`).then(
        (respuesta) => respuesta.datos.map(tagArticuloDesdeApi)
    );
};

export const postArticulo: PostArticulo = async (articulo) =>
    await RestAPI.post(
        baseUrl,
        {
            id: (articulo.id ?? "").trim(),
            descripcion: articulo.descripcion ?? "",
            ...(articulo.grupoIvaProductoId ? { grupo_iva_producto_id: articulo.grupoIvaProductoId } : {}),
        },
        tVentas("articulo.errores.crear")
    ).then((respuesta) => String(respuesta.id));

export const patchArticulo: PatchArticulo = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        cambiosArticuloAApi(cambios),
        tVentas("articulo.errores.guardar")
    );
};
