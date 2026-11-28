import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Entidad } from "@olula/lib/diseño.js";
import {
    Caja,
    CajaContenido,
    CajaDetalle,
    CajaMonoproducto,
    CajaMonoproductoContenido,
    CambiosCaja,
    ComponenteCaja,
    DeleteCaja,
    GetCaja,
    GetCajas,
    MaterialCaja,
    MovimientoCaja,
    NuevaCaja,
    PatchCaja,
    PostCaja,
} from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

interface CajaAPI extends Entidad {
    id: string;
    lpn: string;
    ubicacion_id: string;
    ubicacion: string;
    contenedor_id?: string | null;
    sku?: string | null;
    id_lote?: string | null;
    cantidad?: number | null;
}

interface MovimientoCajaAPI {
    id: string;
    cantidad: number;
    fecha_hora: string;
    lote_id: string;
    ubicacion_id: string;
    ubicacion: string;
    concepto: string;
}

interface MaterialCajaAPI {
    id: string;
    sku: string;
    descripcion: string;
    cantidad: number;
    movimientos: MovimientoCajaAPI[];
}

interface CajaContenidoAPI extends CajaAPI {
    contenido: ComponenteCajaAPI[];
}

interface CajaMonoproductoContenidoAPI extends CajaAPI {
    contenido: MaterialCajaAPI[];
}

type ComponenteCajaAPI = CajaContenidoAPI | MaterialCajaAPI;

interface NuevaCajaAPI {
    ubicacion_id: string;
    tipo_id: string;
    contenedor_id?: string | null;
    sku?: string | null;
    id_lote?: string | null;
    cantidad?: number | null;
}

type CambiosCajaAPI = Partial<CajaAPI>;

const baseUrl = `/almacen/caja`;

const esMaterialAPI = (comp: ComponenteCajaAPI): comp is MaterialCajaAPI =>
    !("lpn" in comp);

const esCajaMonoproductoContenidoAPI = (
    caja: CajaContenidoAPI
): caja is CajaMonoproductoContenidoAPI =>
    caja.sku != null;

const movimientoDesdeApi = (mov: MovimientoCajaAPI): MovimientoCaja => ({
    id: mov.id,
    cantidad: String(mov.cantidad),
    fechaHora: new Date(mov.fecha_hora),
    idLote: mov.lote_id,
    idUbicacion: mov.ubicacion_id,
    ubicacion: mov.ubicacion,
    concepto: mov.concepto,
});

const materialDesdeApi = (mat: MaterialCajaAPI): MaterialCaja => ({
    id: mat.id,
    sku: mat.sku,
    descripcion: mat.descripcion,
    cantidad: mat.cantidad,
    movimientos: mat.movimientos.map(movimientoDesdeApi),
});

const componenteDesdeApi = (comp: ComponenteCajaAPI): ComponenteCaja => {
    if (esMaterialAPI(comp)) {
        return materialDesdeApi(comp);
    }
    return cajaContenidoNormalDesdeApi(comp);
};

export const cajaDesdeApi = (cajaApi: CajaAPI): Caja | CajaMonoproducto => {
    const base: Caja = {
        id: cajaApi.id,
        lpn: cajaApi.lpn,
        idUbicacion: cajaApi.ubicacion_id,
        ubicacion: cajaApi.ubicacion,
        idContenedor: cajaApi.contenedor_id ?? null,
    };
    if (cajaApi.sku != null) {
        return {
            ...base,
            sku: cajaApi.sku,
            idLote: cajaApi.id_lote ?? null,
            cantidad: cajaApi.cantidad ?? 0,
        };
    }
    return base;
};

const cajaContenidoNormalDesdeApi = (cajaApi: CajaContenidoAPI): CajaContenido => ({
    id: cajaApi.id,
    lpn: cajaApi.lpn,
    idUbicacion: cajaApi.ubicacion_id,
    ubicacion: cajaApi.ubicacion,
    idContenedor: cajaApi.contenedor_id ?? null,
    contenido: cajaApi.contenido.map(componenteDesdeApi),
});

const cajaMonoproductoContenidoDesdeApi = (
    cajaApi: CajaMonoproductoContenidoAPI
): CajaMonoproductoContenido => ({
    id: cajaApi.id,
    lpn: cajaApi.lpn,
    idUbicacion: cajaApi.ubicacion_id,
    ubicacion: cajaApi.ubicacion,
    idContenedor: cajaApi.contenedor_id ?? null,
    sku: cajaApi.sku ?? null,
    idLote: cajaApi.id_lote ?? null,
    cantidad: cajaApi.cantidad ?? 0,
    materiales: cajaApi.contenido.map(materialDesdeApi),
});

const cajaDetalleDesdeApi = (cajaApi: CajaContenidoAPI): CajaDetalle => {
    if (esCajaMonoproductoContenidoAPI(cajaApi)) {
        return cajaMonoproductoContenidoDesdeApi(cajaApi);
    }
    return cajaContenidoNormalDesdeApi(cajaApi);
};

const nuevaCajaAApi = (caja: NuevaCaja): NuevaCajaAPI => ({
    ubicacion_id: caja.idUbicacion,
    tipo_id: caja.idTipoCaja,
    contenedor_id: caja.idContenedor,
    ...(caja.sku != null && { sku: caja.sku }),
    ...(caja.idLote != null && { id_lote: caja.idLote }),
    ...(caja.cantidad != null && { cantidad: caja.cantidad }),
});

const cambiosCajaAApi = (cambios: CambiosCaja): CambiosCajaAPI => {
    const api: CambiosCajaAPI = {};
    if (cambios.idUbicacion !== undefined) api.ubicacion_id = cambios.idUbicacion;
    if (cambios.idContenedor !== undefined) api.contenedor_id = cambios.idContenedor;
    if (cambios.sku !== undefined) api.sku = cambios.sku;
    if (cambios.idLote !== undefined) api.id_lote = cambios.idLote;
    if (cambios.cantidad !== undefined) api.cantidad = cambios.cantidad;
    return api;
};

export const getCaja: GetCaja = async (id) => {
    return await RestAPI.getItem<CajaDetalle, CajaContenidoAPI>(
        `${baseUrl}/${id}`,
        cajaDetalleDesdeApi,
    );
};

export const getCajas: GetCajas = async (criteria) => {
    return await RestAPI.getQuery<Caja, CajaAPI>(
        baseUrl,
        criteria,
        cajaDesdeApi,
    );
};

export const postCaja: PostCaja = async (nuevaCaja) => {
    const respuesta = await RestAPI.post<NuevaCajaAPI>(
        baseUrl,
        nuevaCajaAApi(nuevaCaja),
        tAlmacen("caja.errorAlCrearCaja")
    );
    return respuesta.id;
};

export const patchCaja: PatchCaja = async (id, cambios) => {
    await RestAPI.patch<CambiosCajaAPI>(
        `${baseUrl}/${id}`,
        cambiosCajaAApi(cambios),
        tAlmacen("caja.errorAlGuardarCaja")
    );
};

export const deleteCaja: DeleteCaja = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        tAlmacen("caja.errorAlBorrarCaja")
    );
};
