import ApiUrls from "#/contabilidad/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    CambiosGrupoContableAmortizacion,
    DeleteGrupoContableAmortizacion,
    GetGrupoContableAmortizacion,
    GetGruposContablesAmortizacion,
    GrupoContableAmortizacion,
    NuevoGrupoContableAmortizacion,
    PatchGrupoContableAmortizacion,
    PostGrupoContableAmortizacion,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

const urls = new ApiUrls();
const baseUrl = urls.GRUPO_CONTABLE_AMORTIZACION;

const urlGrupo = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;

export interface GrupoContableAmortizacionApi {
    id: string;
    descripcion: string | null;
    subcuenta_elemento: string;
    descripcion_subcuenta_elemento: string | null;
    subcuenta_amortizacion: string;
    descripcion_subcuenta_amortizacion: string | null;
    subcuenta_gasto: string;
    descripcion_subcuenta_gasto: string | null;
    subcuenta_perdidas: string;
    descripcion_subcuenta_perdidas: string | null;
    subcuenta_ganancias: string;
    descripcion_subcuenta_ganancias: string | null;
}

export const grupoDesdeApi = (api: GrupoContableAmortizacionApi): GrupoContableAmortizacion => ({
    id: api.id,
    descripcion: api.descripcion ?? "",
    subcuentaElemento: api.subcuenta_elemento ?? "",
    subcuentaAmortizacion: api.subcuenta_amortizacion ?? "",
    subcuentaGasto: api.subcuenta_gasto ?? "",
    subcuentaPerdidas: api.subcuenta_perdidas ?? "",
    subcuentaGanancias: api.subcuenta_ganancias ?? "",
    descripcionesSubcuentas: {
        elemento: api.descripcion_subcuenta_elemento ?? "",
        amortizacion: api.descripcion_subcuenta_amortizacion ?? "",
        gasto: api.descripcion_subcuenta_gasto ?? "",
        perdidas: api.descripcion_subcuenta_perdidas ?? "",
        ganancias: api.descripcion_subcuenta_ganancias ?? "",
    },
});

const CAMPOS_API: [keyof CambiosGrupoContableAmortizacion, string][] = [
    ["subcuentaElemento", "subcuenta_elemento"],
    ["subcuentaAmortizacion", "subcuenta_amortizacion"],
    ["subcuentaGasto", "subcuenta_gasto"],
    ["subcuentaPerdidas", "subcuenta_perdidas"],
    ["subcuentaGanancias", "subcuenta_ganancias"],
];

export const cambiosGrupoAApi = (cambios: CambiosGrupoContableAmortizacion) => {
    const api: Record<string, string | null> = {};
    if (cambios.descripcion !== undefined) {
        api.descripcion = cambios.descripcion.trim() || null;
    }
    for (const [campo, campoApi] of CAMPOS_API) {
        const valor = cambios[campo];
        if (valor !== undefined) api[campoApi] = valor.trim();
    }
    return api;
};

export const nuevoGrupoAApi = (nuevo: NuevoGrupoContableAmortizacion, ejercicioId: string) => {
    const { id, ...resto } = nuevo;
    return { id: id.trim(), ejercicio_id: ejercicioId, ...cambiosGrupoAApi(resto) };
};

export const getGruposContablesAmortizacion: GetGruposContablesAmortizacion = async (criteria) =>
    RestAPI.getQuery<GrupoContableAmortizacion, GrupoContableAmortizacionApi>(
        baseUrl, criteria, grupoDesdeApi
    );

export const getGrupoContableAmortizacion: GetGrupoContableAmortizacion = async (id) =>
    RestAPI.getItem<GrupoContableAmortizacion, GrupoContableAmortizacionApi>(
        urlGrupo(id), grupoDesdeApi
    );

export const postGrupoContableAmortizacion: PostGrupoContableAmortizacion = async (nuevo, ejercicioId) => {
    const respuesta = await RestAPI.post(
        baseUrl, nuevoGrupoAApi(nuevo, ejercicioId), tContabilidad("grupo_contable_amortizacion.errorAlCrearElGrupoContable")
    );
    return String(respuesta.id);
};

export const patchGrupoContableAmortizacion: PatchGrupoContableAmortizacion = async (
    id, cambios, ejercicioId
) => {
    await RestAPI.patch(
        urlGrupo(id),
        { ...cambiosGrupoAApi(cambios), ejercicio_id: ejercicioId },
        tContabilidad("grupo_contable_amortizacion.errorAlGuardarElGrupoContable")
    );
};

export const deleteGrupoContableAmortizacion: DeleteGrupoContableAmortizacion = async (id) => {
    await RestAPI.delete(urlGrupo(id), tContabilidad("grupo_contable_amortizacion.errorAlBorrarElGrupoContable"));
};
