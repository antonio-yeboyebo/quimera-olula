import { tCompras } from "#/compras/i18n/index.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "../comun/urls.ts";
import {
    ArticuloProveedor,
    CambiosArticuloProveedor,
    DeleteArticuloProveedor,
    GetArticuloProveedor,
    GetArticulosDeProveedor,
    GetProveedoresDeArticulo,
    MarcarPorDefectoArticuloProveedor,
    NuevoArticuloProveedor,
    PatchArticuloProveedor,
    PostArticuloProveedor,
} from "./diseño.ts";

interface ArticuloProveedorApi {
    id: string;
    articulo_id: string;
    articulo: string;
    proveedor_id: string;
    nombre_proveedor: string;
    coste: number;
    divisa_id: string;
    dto: number;
    ref_proveedor: string | null;
    plazo: number | null;
    uni_embalaje: number | null;
    requiere_embalajes: boolean;
    por_defecto: boolean;
}

const urls = new ApiUrls();
const baseUrl = urls.ARTICULO_PROVEEDOR;

export const articuloProveedorDesdeApi = (
    api: ArticuloProveedorApi
): ArticuloProveedor => ({
    id: String(api.id),
    articuloId: api.articulo_id,
    articulo: api.articulo,
    proveedorId: api.proveedor_id,
    proveedor: api.nombre_proveedor,
    coste: api.coste,
    divisaId: api.divisa_id,
    dto: api.dto,
    refProveedor: api.ref_proveedor ?? "",
    plazo: api.plazo,
    uniEmbalaje: api.uni_embalaje,
    requiereEmbalajes: api.requiere_embalajes,
    porDefecto: api.por_defecto,
});

const oNulo = (valor: string): string | null => (valor === "" ? null : valor);

const nuevoAApi = (nuevo: NuevoArticuloProveedor): Record<string, unknown> => ({
    articulo_id: nuevo.articuloId,
    proveedor_id: nuevo.proveedorId,
    coste: nuevo.coste,
    ...(nuevo.divisaId ? { divisa_id: nuevo.divisaId } : {}),
    dto: nuevo.dto,
    ref_proveedor: oNulo(nuevo.refProveedor),
    plazo: nuevo.plazo,
    uni_embalaje: nuevo.uniEmbalaje,
    requiere_embalajes: nuevo.requiereEmbalajes,
});

const cambiosAApi = (
    cambios: CambiosArticuloProveedor
): Record<string, unknown> => {
    const api: Record<string, unknown> = {};

    if (cambios.coste !== undefined) api.coste = cambios.coste;
    if (cambios.divisaId !== undefined) api.divisa_id = cambios.divisaId;
    if (cambios.dto !== undefined) api.dto = cambios.dto;
    if (cambios.refProveedor !== undefined) api.ref_proveedor = oNulo(cambios.refProveedor);
    if (cambios.plazo !== undefined) api.plazo = cambios.plazo;
    if (cambios.uniEmbalaje !== undefined) api.uni_embalaje = cambios.uniEmbalaje;
    if (cambios.requiereEmbalajes !== undefined) api.requiere_embalajes = cambios.requiereEmbalajes;

    return api;
};

export const getProveedoresDeArticulo: GetProveedoresDeArticulo = async (articuloId) => {
    const respuesta = await RestAPI.get<{ datos: ArticuloProveedorApi[]; total: number }>(
        `${urls.ARTICULO}/${articuloId}/proveedor`,
        tCompras("articuloProveedor.errores.proveedoresArticulo")
    );

    return {
        datos: respuesta.datos.map(articuloProveedorDesdeApi),
        total: respuesta.total,
    };
};

export const getArticulosDeProveedor: GetArticulosDeProveedor = async (
    proveedorId,
    criteria
) =>
    await RestAPI.getQuery<ArticuloProveedor, ArticuloProveedorApi>(
        `${urls.PROVEEDOR}/${proveedorId}/articulo`,
        criteria,
        articuloProveedorDesdeApi,
        tCompras("articuloProveedor.errores.articulosProveedor")
    );

export const getArticuloProveedor: GetArticuloProveedor = async (id) =>
    await RestAPI.getItem<ArticuloProveedor, ArticuloProveedorApi>(
        `${baseUrl}/${id}`,
        articuloProveedorDesdeApi,
        tCompras("articuloProveedor.errores.obtener")
    );

export const postArticuloProveedor: PostArticuloProveedor = async (nuevo) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        nuevoAApi(nuevo),
        tCompras("articuloProveedor.errores.crear")
    );

    return String(respuesta.id);
};

export const patchArticuloProveedor: PatchArticuloProveedor = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        cambiosAApi(cambios),
        tCompras("articuloProveedor.errores.guardar")
    );
};

export const deleteArticuloProveedor: DeleteArticuloProveedor = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tCompras("articuloProveedor.errores.borrar"));
};

export const marcarPorDefecto: MarcarPorDefectoArticuloProveedor = async (id) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/por-defecto`,
        {},
        tCompras("articuloProveedor.errores.porDefecto")
    );
};
