import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "@olula/lib/api/urls.ts";
import {
    CambiosPais,
    DeletePais,
    GetPais,
    GetPaisesMaestro,
    NuevoPais,
    Pais,
    PatchPais,
    PostPais,
} from "./diseño.ts";
import { tComun } from "../i18n/index.ts";

const baseUrl = ApiUrls.COMUN_PAIS;

const urlPais = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;

export interface PaisApi {
    id: string;
    nombre: string | null;
    codiso: string | null;
    codigo_iso_alpha2: string | null;
    codigo_iso_alpha3: string | null;
    en_ue: boolean | null;
    zona_id: string | null;
    descripcion_zona: string | null;
    zona_sepa: boolean | null;
    validar_provincias: boolean | null;
    exigir_validacion: boolean | null;
    funcion_validacion: string | null;
}

export const paisDesdeApi = (api: PaisApi): Pais => ({
    id: api.id,
    nombre: api.nombre ?? "",
    codiso: api.codiso ?? "",
    codigoIsoAlpha2: api.codigo_iso_alpha2 ?? "",
    codigoIsoAlpha3: api.codigo_iso_alpha3 ?? "",
    enUe: !!api.en_ue,
    zonaId: api.zona_id ?? "",
    descripcionZona: api.descripcion_zona ?? "",
    zonaSepa: !!api.zona_sepa,
    validarProvincias: !!api.validar_provincias,
    exigirValidacion: !!api.exigir_validacion,
    funcionValidacion: api.funcion_validacion ?? "",
});

const CAMPOS_API: [keyof CambiosPais, string][] = [
    ["nombre", "nombre"],
    ["codiso", "codiso"],
    ["codigoIsoAlpha2", "codigo_iso_alpha2"],
    ["codigoIsoAlpha3", "codigo_iso_alpha3"],
    ["enUe", "en_ue"],
    ["zonaId", "zona_id"],
    ["zonaSepa", "zona_sepa"],
    ["validarProvincias", "validar_provincias"],
    ["exigirValidacion", "exigir_validacion"],
    ["funcionValidacion", "funcion_validacion"],
];

export const cambiosPaisAApi = (cambios: CambiosPais) => {
    const api: Record<string, unknown> = {};
    for (const [campo, campoApi] of CAMPOS_API) {
        const valor = cambios[campo];
        if (valor === undefined) continue;
        api[campoApi] = typeof valor === "string" ? valor.trim() || null : valor;
    }
    return api;
};

export const nuevoPaisAApi = (nuevo: NuevoPais) => {
    const { id, ...resto } = nuevo;
    return { id: id.trim(), ...cambiosPaisAApi(resto) };
};

export const getPaisesMaestro: GetPaisesMaestro = async (criteria) =>
    RestAPI.getQuery<Pais, PaisApi>(baseUrl, criteria, paisDesdeApi);

export const getPais: GetPais = async (id) => RestAPI.getItem<Pais, PaisApi>(urlPais(id), paisDesdeApi);

export const postPais: PostPais = async (nuevo) => {
    const respuesta = await RestAPI.post(baseUrl, nuevoPaisAApi(nuevo), tComun("paises.errorAlCrearElPais"));
    return String(respuesta.id);
};

export const patchPais: PatchPais = async (id, cambios) => {
    await RestAPI.patch(urlPais(id), cambiosPaisAApi(cambios), tComun("paises.errorAlGuardarElPais"));
};

export const deletePais: DeletePais = async (id) => {
    await RestAPI.delete(urlPais(id), tComun("paises.errorAlBorrarElPais"));
};
