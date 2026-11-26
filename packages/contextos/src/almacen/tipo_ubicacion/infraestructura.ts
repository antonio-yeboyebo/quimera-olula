import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import {
    DeleteTipoUbicacion,
    FormatoUbicacion,
    GetTipoUbicacion,
    GetTiposUbicacion,
    NuevoTipoUbicacion,
    PatchTipoUbicacion,
    PostTipoUbicacion,
    TipoUbicacion,
} from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

const baseUrl = `/almacen/tipo_ubicacion`;

interface TipoUbicacionApi {
    id: string;
    codigo: string;
    descripcion: string;
    formato: FormatoUbicacion;
    capacidad_palets: number | null;
    peso_max: number | null;
    altura_max: number | null;
    multi_referencia: boolean;
    multi_lote: boolean;
}

type NuevoTipoUbicacionApi = Omit<TipoUbicacionApi, "id">;
type CambiosTipoUbicacionApi = Partial<NuevoTipoUbicacionApi>;

const aBooleano = (v: unknown): boolean => v === true || v === "true" || v === "1";

export const tipoUbicacionDesdeApi = (api: TipoUbicacionApi): TipoUbicacion => ({
    id: api.id,
    codigo: api.codigo,
    descripcion: api.descripcion,
    formato: api.formato,
    capacidadPalets: api.capacidad_palets,
    pesoMax: api.peso_max,
    alturaMax: api.altura_max,
    multiReferencia: api.multi_referencia,
    multiLote: api.multi_lote,
});

const nuevoTipoUbicacionAApi = (t: NuevoTipoUbicacion): NuevoTipoUbicacionApi => ({
    codigo: t.codigo,
    descripcion: t.descripcion,
    formato: t.formato,
    capacidad_palets: t.capacidadPalets,
    peso_max: t.pesoMax,
    altura_max: t.alturaMax,
    multi_referencia: aBooleano(t.multiReferencia),
    multi_lote: aBooleano(t.multiLote),
});

const cambiosTipoUbicacionAApi = (t: Partial<TipoUbicacion>): CambiosTipoUbicacionApi => {
    const c: CambiosTipoUbicacionApi = {};
    if (t.codigo !== undefined) c.codigo = t.codigo;
    if (t.descripcion !== undefined) c.descripcion = t.descripcion;
    if (t.formato !== undefined) c.formato = t.formato;
    if (t.capacidadPalets !== undefined) c.capacidad_palets = t.capacidadPalets;
    if (t.pesoMax !== undefined) c.peso_max = t.pesoMax;
    if (t.alturaMax !== undefined) c.altura_max = t.alturaMax;
    if (t.multiReferencia !== undefined) c.multi_referencia = aBooleano(t.multiReferencia);
    if (t.multiLote !== undefined) c.multi_lote = aBooleano(t.multiLote);
    return c;
};

export const getTipoUbicacion: GetTipoUbicacion = async (id) =>
    RestAPI.getItem<TipoUbicacion, TipoUbicacionApi>(`${baseUrl}/${id}`, tipoUbicacionDesdeApi);

export const getTiposUbicacion: GetTiposUbicacion = async (criteria: Criteria) =>
    RestAPI.getQuery<TipoUbicacion, TipoUbicacionApi>(baseUrl, criteria, tipoUbicacionDesdeApi);

export const postTipoUbicacion: PostTipoUbicacion = async (nuevo) => {
    const respuesta = await RestAPI.post<NuevoTipoUbicacionApi>(
        baseUrl,
        nuevoTipoUbicacionAApi(nuevo),
        tAlmacen("tipo_ubicacion.errorAlCrearTipoDeUbicacion")
    );
    return respuesta.id;
};

export const patchTipoUbicacion: PatchTipoUbicacion = async (id, cambios) => {
    await RestAPI.patch<CambiosTipoUbicacionApi>(
        `${baseUrl}/${id}`,
        cambiosTipoUbicacionAApi(cambios),
        tAlmacen("tipo_ubicacion.errorAlActualizarTipoDeUbicacion")
    );
};

export const deleteTipoUbicacion: DeleteTipoUbicacion = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tAlmacen("tipo_ubicacion.errorAlBorrarTipoDeUbicacion"));
};
