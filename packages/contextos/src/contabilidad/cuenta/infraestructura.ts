import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "#/contabilidad/comun/urls.ts";
import {
    CambiosCuenta,
    Cuenta,
    DeleteCuenta,
    GetCuenta,
    GetCuentas,
    NuevaCuenta,
    PatchCuenta,
    PostCuenta,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

const baseUrl = new ApiUrls().CUENTA;

export interface CuentaApi {
    id: number;
    codigo: string;
    nombre: string;
    ejercicio_id: string;
    codigo_epigrafe: string | null;
    nivel: number;
    cuenta_especial_id?: string | null;
    es_iva?: boolean;
}

export const cuentaDesdeApi = (api: CuentaApi): Cuenta => ({
    id: String(api.id),
    codigo: api.codigo,
    nombre: api.nombre,
    ejercicioId: api.ejercicio_id,
    codigoEpigrafe: api.codigo_epigrafe,
    nivel: api.nivel,
    cuentaEspecialId: api.cuenta_especial_id ?? "",
    esIva: api.es_iva ?? false,
});

export const getCuentas: GetCuentas = async (criteria) =>
    RestAPI.getQuery<Cuenta, CuentaApi>(baseUrl, criteria, cuentaDesdeApi);

export const getCuenta: GetCuenta = async (id) =>
    RestAPI.getItem<Cuenta, CuentaApi>(`${baseUrl}/${id}`, cuentaDesdeApi);

export const nuevaCuentaAApi = (nuevo: NuevaCuenta) => ({
    codigo: nuevo.codigo,
    nombre: nuevo.nombre,
    codigo_epigrafe: nuevo.codigoEpigrafe,
    ejercicio_id: nuevo.ejercicioId,
});

export const postCuenta: PostCuenta = async (nuevo) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        nuevaCuentaAApi(nuevo),
        tContabilidad("cuenta.errorAlCrearCuenta"),
    );
    return String(respuesta.id);
};

export const cambiosCuentaAApi = (cambios: CambiosCuenta) => {
    const api: Record<string, string> = {};
    if (cambios.nombre !== undefined) api.nombre = cambios.nombre;
    return api;
};

export const patchCuenta: PatchCuenta = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        cambiosCuentaAApi(cambios),
        tContabilidad("cuenta.errorAlGuardarCuenta"),
    );
};

export const deleteCuenta: DeleteCuenta = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tContabilidad("cuenta.errorAlBorrarCuenta"));
};
