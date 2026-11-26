import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "#/contabilidad/comun/urls.ts";
import {
    CambiosCuentaEspecial,
    CuentaEspecial,
    DeleteCuentaEspecial,
    GetCuentaEspecial,
    GetCuentasEspeciales,
    NuevaCuentaEspecial,
    PatchCuentaEspecial,
    PostCuentaEspecial,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

const baseUrl = new ApiUrls().CUENTA_ESPECIAL;

export interface CuentaEspecialApi {
    id: string;
    descripcion: string;
    codigo_cuenta: string | null;
    codigo_subcuenta: string | null;
}

export const cuentaEspecialDesdeApi = (
    api: CuentaEspecialApi
): CuentaEspecial => ({
    id: api.id,
    descripcion: api.descripcion ?? "",
    codigoCuenta: api.codigo_cuenta ?? "",
    codigoSubcuenta: api.codigo_subcuenta ?? "",
});

export const getCuentasEspeciales: GetCuentasEspeciales = async (criteria) =>
    RestAPI.getQuery<CuentaEspecial, CuentaEspecialApi>(
        baseUrl,
        criteria,
        cuentaEspecialDesdeApi
    );

export const getCuentaEspecial: GetCuentaEspecial = async (id) =>
    RestAPI.getItem<CuentaEspecial, CuentaEspecialApi>(
        `${baseUrl}/${id}`,
        cuentaEspecialDesdeApi
    );

export const nuevaCuentaEspecialAApi = (nuevo: NuevaCuentaEspecial) => ({
    id: nuevo.id,
    descripcion: nuevo.descripcion,
    ...(nuevo.codigoCuenta ? { codigo_cuenta: nuevo.codigoCuenta } : {}),
    ...(nuevo.codigoSubcuenta
        ? { codigo_subcuenta: nuevo.codigoSubcuenta }
        : {}),
});

export const postCuentaEspecial: PostCuentaEspecial = async (nuevo) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        nuevaCuentaEspecialAApi(nuevo),
        tContabilidad("cuenta_especial.errorAlCrearLaCuentaEspecial"),
    );
    return String(respuesta.id);
};

export const cambiosCuentaEspecialAApi = (
    cambios: CambiosCuentaEspecial
) => {
    const api: Record<string, string | null> = {};
    if (cambios.descripcion !== undefined) {
        api.descripcion = cambios.descripcion;
    }
    if (cambios.codigoCuenta !== undefined) {
        api.codigo_cuenta = cambios.codigoCuenta || null;
    }
    if (cambios.codigoSubcuenta !== undefined) {
        api.codigo_subcuenta = cambios.codigoSubcuenta || null;
    }
    return api;
};

export const patchCuentaEspecial: PatchCuentaEspecial = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        cambiosCuentaEspecialAApi(cambios),
        tContabilidad("cuenta_especial.errorAlGuardarLaCuentaEspecial"),
    );
};

export const deleteCuentaEspecial: DeleteCuentaEspecial = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        tContabilidad("cuenta_especial.errorAlBorrarLaCuentaEspecial")
    );
};
