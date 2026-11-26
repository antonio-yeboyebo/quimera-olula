import { tCompras } from "#/compras/i18n/index.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
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
import { filtroArticulosCompra } from "./dominio.ts";

interface ArticuloApi {
    id: string;
    descripcion: string;
    observaciones: string | null;
    familia_id: string | null;
    descripcion_familia: string | null;
    grupo_iva_producto_id: string | null;
    sin_stock: boolean;
    se_compra: boolean;
}

interface TagArticuloApi {
    id: string;
    descripcion: string;
    grupo_iva_producto_id: string | null;
}

const baseUrl = new ApiUrls().ARTICULO;

const tagArticuloDesdeApi = (t: TagArticuloApi): TagArticulo => ({
    id: t.id,
    descripcion: t.descripcion,
    grupoIvaProductoId: t.grupo_iva_producto_id ?? "",
});

export const articuloDesdeApi = (api: ArticuloApi): Articulo => ({
    id: api.id,
    descripcion: api.descripcion,
    observaciones: api.observaciones ?? "",
    familiaId: api.familia_id ?? "",
    descripcionFamilia: api.descripcion_familia ?? "",
    grupoIvaProductoId: api.grupo_iva_producto_id ?? "",
    noStock: api.sin_stock,
    seCompra: api.se_compra,
});

const oNulo = (valor: string): string | null => valor === "" ? null : valor;

const cambiosArticuloAApi = (cambios: CambiosArticulo): Record<string, unknown> => {
    const api: Record<string, unknown> = {};

    if (cambios.descripcion !== undefined) api.descripcion = cambios.descripcion;
    if (cambios.observaciones !== undefined) api.observaciones = oNulo(cambios.observaciones);
    if (cambios.familiaId !== undefined) api.familia_id = oNulo(cambios.familiaId);
    if (cambios.grupoIvaProductoId !== undefined) api.grupo_iva_producto_id = oNulo(cambios.grupoIvaProductoId);

    return api;
};

export const getArticulo: GetArticulo = async (id) =>
    await RestAPI.getItem<Articulo, ArticuloApi>(
        `${baseUrl}/${id}`,
        articuloDesdeApi,
        tCompras("articulo.errores.obtener")
    );

export const getArticulos: GetArticulos = async (criteria) =>
    await RestAPI.getQuery<Articulo, ArticuloApi>(
        baseUrl,
        { ...criteria, filtro: filtroArticulosCompra(criteria.filtro) },
        articuloDesdeApi,
        tCompras("articulo.errores.obtenerLista")
    );

export const postArticulo: PostArticulo = async (articulo) =>
    await RestAPI.post(
        baseUrl,
        {
            id: (articulo.id ?? "").trim(),
            descripcion: articulo.descripcion ?? "",
            ...(articulo.grupoIvaProductoId ? { grupo_iva_producto_id: articulo.grupoIvaProductoId } : {}),
        },
        tCompras("articulo.errores.crear")
    ).then((respuesta) => String(respuesta.id));

export const patchArticulo: PatchArticulo = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        cambiosArticuloAApi(cambios),
        tCompras("articulo.errores.guardar")
    );
};

export const getTagsArticulo: GetTagsArticulo = async (filtro, orden) => {
    const q = criteriaQuery(filtro, orden);

    return RestAPI.get<{ datos: TagArticuloApi[] }>(`${baseUrl}/tags${q}`).then(
        (respuesta) => respuesta.datos.map(tagArticuloDesdeApi)
    );
};
