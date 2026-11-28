import { tipoCodBarrasDesdeApi } from "#/valores/codbarras.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import {
    Articulo, ArticuloAlmacen, ArticuloItem,
    CambiosArticulo,
    CambiosCajaProveedor,
    DeleteArticulo,
    DeleteCajaProveedor,
    GetArticulo,
    GetArticulos,
    LeerCodBarras,
    NuevaCajaProveedor,
    PatchArticulo,
    PatchCajaProveedor,
    PatchCajaProveedorDefecto,
    PostArticulo,
    PostCajaProveedor,
    SkuLote
} from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

const baseUrlArticulo = "/almacen/articulo";

type ArticuloAlmacenApi = ArticuloAlmacen;

const articuloAlmacenDesdeApi = (t: ArticuloAlmacenApi): ArticuloAlmacen => t;

export const obtenerArticulosAlmacen = async (filtro: Filtro, orden: Orden): Promise<ArticuloAlmacen[]> => {
    const q = criteriaQuery(filtro, orden);

    return RestAPI.get<{ datos: ArticuloAlmacenApi[] }>(baseUrlArticulo + q).then((respuesta) => respuesta.datos.map(articuloAlmacenDesdeApi));
}

interface CajaProveedorArticuloApi {
    id: string
    tipo_caja_id: string
    tipo_caja: string
    cantidad: number
}

interface ProveedorArticuloApi {
    id: string
    proveedor_id: string
    proveedor: string
    embalajes: CajaProveedorArticuloApi[]
    embalaje_por_defecto_id: string | null
}

interface ArticuloItemApi {
    id: string;
    descripcion: string;
    observaciones: string | null;
    barcode: string | null;
    tipo_barcode: string | null;
    familia_id: string | null;
    descripcion_familia: string | null;
    unidad_id?: string | null;
    sin_stock: boolean;
    se_compra: boolean;
    se_vende: boolean;
    clase_almacenamiento_id?: string | null;
    clase_almacenamiento?: string | null;
    largo?: number | null;
    ancho?: number | null;
    alto?: number | null;
}

interface ArticuloApi extends ArticuloItemApi {
    proveedores: ProveedorArticuloApi[]
}

const articuloItemDesdeApi = (api: ArticuloItemApi): ArticuloItem => ({
    id: api.id,
    descripcion: api.descripcion,
    observaciones: api.observaciones ?? "",
    codbarras: api.barcode ?? "",
    tipoCodBarras: tipoCodBarrasDesdeApi(api.tipo_barcode),
    familiaId: api.familia_id ?? "",
    descripcionFamilia: api.descripcion_familia ?? "",
    unidadId: api.unidad_id ?? "",
    noStock: api.sin_stock,
    seCompra: api.se_compra,
    seVende: api.se_vende,
    claseAlmacenamientoId: api.clase_almacenamiento_id ?? "",
    claseAlmacenamiento: api.clase_almacenamiento ?? "",
    largo: api.largo ?? null,
    ancho: api.ancho ?? null,
    alto: api.alto ?? null,
});

const articuloDesdeApi = (api: ArticuloApi): Articulo => ({
    ...articuloItemDesdeApi(api),
    proveedores: api.proveedores.map((p) => ({
        id: p.id,
        idProveedor: p.proveedor_id,
        proveedor: p.proveedor,
        embalajes: p.embalajes.map((e) => ({
            id: e.id,
            idTipoCaja: e.tipo_caja_id,
            tipoCaja: e.tipo_caja,
            cantidad: e.cantidad,
            esDefecto: e.id === p.embalaje_por_defecto_id,
        })),
    })),
});

const oNulo = (valor: string): string | null => (valor === "" ? null : valor);

const cambiosArticuloAApi = (cambios: CambiosArticulo): Record<string, unknown> => {
    const api: Record<string, unknown> = {};

    if (cambios.descripcion !== undefined) api.descripcion = cambios.descripcion;
    if (cambios.observaciones !== undefined) api.observaciones = oNulo(cambios.observaciones);
    if (cambios.codbarras !== undefined) api.barcode = oNulo(cambios.codbarras);
    if (cambios.tipoCodBarras !== undefined) api.tipo_barcode = oNulo(cambios.tipoCodBarras);
    if (cambios.familiaId !== undefined) api.familia_id = oNulo(cambios.familiaId);
    if (cambios.unidadId !== undefined) api.unidad_id = oNulo(cambios.unidadId);
    if (cambios.noStock !== undefined) api.sin_stock = cambios.noStock;
    if (cambios.seCompra !== undefined) api.se_compra = cambios.seCompra;
    if (cambios.seVende !== undefined) api.se_vende = cambios.seVende;
    if (cambios.claseAlmacenamientoId !== undefined) api.clase_almacenamiento_id = oNulo(cambios.claseAlmacenamientoId);
    if (cambios.largo !== undefined) api.largo = cambios.largo;
    if (cambios.ancho !== undefined) api.ancho = cambios.ancho;
    if (cambios.alto !== undefined) api.alto = cambios.alto;

    return api;
};

export const getArticulo: GetArticulo = async (id) =>
    await RestAPI.get<{ datos: ArticuloApi }>(`${baseUrlArticulo}/${id}`).then((respuesta) =>
        articuloDesdeApi(respuesta.datos)
    );

export const getArticulos: GetArticulos = async (
    filtro,
    orden,
    paginacion?
) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: ArticuloItemApi[]; total: number }>(baseUrlArticulo + q);
    return { datos: respuesta.datos.map(articuloItemDesdeApi), total: respuesta.total };
};

export const postArticulo: PostArticulo = async (Articulo) => {
    return await RestAPI.post(
        baseUrlArticulo,
        {
            id: (Articulo.id ?? "").trim(),
            descripcion: Articulo.descripcion ?? "",
            ...(Articulo.grupoIvaProductoId ? { grupo_iva_producto_id: Articulo.grupoIvaProductoId } : {}),
        },
        tAlmacen("articulo.errorAlGuardarArticulo")
    ).then((respuesta) => respuesta.id);
};

export const patchArticulo: PatchArticulo = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrlArticulo}/${id}`,
        cambiosArticuloAApi(cambios),
        tAlmacen("articulo.errorAlGuardarElArticulo")
    );
};

export const deleteArticulo: DeleteArticulo = async (id) => {
    await RestAPI.delete(`${baseUrlArticulo}/${id}`, tAlmacen("articulo.errorAlBorrarArticulo"));
};

const baseUrlCajaProveedor = (articuloId: string, proveedorId: string) =>
    `${baseUrlArticulo}/${articuloId}/proveedor/${proveedorId}`;

export const postCajaProveedor: PostCajaProveedor = async (articuloId, proveedorId, nueva: NuevaCajaProveedor) => {
    await RestAPI.post(
        `${baseUrlCajaProveedor(articuloId, proveedorId)}/crear_caja`,
        { descripcion: nueva.descripcion, cantidad: nueva.cantidad },
        tAlmacen("articulo.errorAlCrearLaCaja")
    );
};

export const deleteCajaProveedor: DeleteCajaProveedor = async (articuloId, proveedorId, cajaId) => {
    await RestAPI.delete(
        `${baseUrlCajaProveedor(articuloId, proveedorId)}/borrar_caja/${cajaId}`,
        tAlmacen("articulo.errorAlBorrarLaCaja"),
    );
};

export const patchCajaProveedor: PatchCajaProveedor = async (articuloId, proveedorId, cajaId, cambios: CambiosCajaProveedor) => {
    const body: Record<string, unknown> = {};
    if (cambios.descripcion !== undefined) body.descripcion = cambios.descripcion;
    if (cambios.cantidad !== undefined) body.cantidad = cambios.cantidad;
    await RestAPI.patch(
        `${baseUrlCajaProveedor(articuloId, proveedorId)}/cambiar_caja/${cajaId}`,
        body,
        tAlmacen("articulo.errorAlCambiarLaCaja")
    );
};

export const patchCajaProveedorDefecto: PatchCajaProveedorDefecto = async (articuloId, proveedorId, cajaId) => {
    await RestAPI.patch(
        `${baseUrlCajaProveedor(articuloId, proveedorId)}/cambiar_caja_defecto/`,
        { caja_id: cajaId },
        tAlmacen("articulo.errorAlMarcarLaCajaComo")
    );
};

interface SkuLoteApi {
    id: string;
    descripcion: string;
    lote_id: string | null;
}

export const leerCodBarras: LeerCodBarras = async (codigo) =>
    await RestAPI.get<{ datos: SkuLoteApi }>(`${baseUrlArticulo}/sku_lote/${codigo}`).then(
        (respuesta): SkuLote => ({
            id: respuesta.datos.id,
            descripcion: respuesta.datos.descripcion,
            loteId: respuesta.datos.lote_id,
        })
    );
