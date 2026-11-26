import ApiUrls from "#/almacen/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import { PostBorrarMovimientoLote, PostCrearMovimientoLote } from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

const baseUrl = new ApiUrls().ALBARAN_VENTA;

export const postCrearMovimientoLote: PostCrearMovimientoLote = async (albaranId, lineaId, payload) => {
    await RestAPI.patch(
        `${baseUrl}/${albaranId}/linea/${lineaId}/crear_movimiento_lote`,
        payload,
        tAlmacen("albaran_venta.errorAlCrearMovimientoDeLote")
    );
};

export const postBorrarMovimientoLote: PostBorrarMovimientoLote = async (albaranId, lineaId, payload) => {
    await RestAPI.patch(
        `${baseUrl}/${albaranId}/linea/${lineaId}/borrar_movimiento_lote`,
        payload,
        tAlmacen("albaran_venta.errorAlBorrarMovimientoDeLote")
    );
};
