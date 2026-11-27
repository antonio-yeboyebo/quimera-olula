import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { normalizarIban } from "@olula/lib/iban.ts";
import Tesoreria_Urls from "#/tesoreria/comun/urls.ts";
import {
    CambiosCuentaBancaria,
    CuentaBancaria,
    DeleteCuentaBancaria,
    GetCuentaBancaria,
    GetCuentasBancarias,
    NuevaCuentaBancaria,
    PatchCuentaBancaria,
    PostCuentaBancaria,
} from "./diseño.js";
import { tTesoreria } from "../i18n/index.ts";

export interface CuentaBancariaApi {
    id: string;
    codigo_cuenta: string;
    pais_id: string;
    obsoleta: boolean;
    empresa_id: string | null;
    descripcion: string | null;
    iban: string | null;
    bic: string | null;
    entidad: string | null;
    agencia: string | null;
    digito_control: string | null;
    cuenta: string | null;
}

export interface NuevaCuentaBancariaApi {
    iban: string;
    descripcion?: string;
}

type CambiosCuentaBancariaApi = Partial<CuentaBancariaApi>;

const baseUrl = new Tesoreria_Urls().CUENTAS_BANCARIAS;

export const cuentaBancariaDesdeApi = (api: CuentaBancariaApi): CuentaBancaria => ({
    id: api.id,
    codigoCuenta: api.codigo_cuenta,
    paisId: api.pais_id,
    obsoleta: api.obsoleta,
    empresaId: api.empresa_id ?? "",
    descripcion: api.descripcion ?? "",
    iban: api.iban ?? "",
    bic: api.bic ?? "",
    entidad: api.entidad ?? "",
    agencia: api.agencia ?? "",
    digitoControl: api.digito_control ?? "",
    cuenta: api.cuenta ?? "",
});

export const nuevaCuentaBancariaAApi = (c: NuevaCuentaBancaria): NuevaCuentaBancariaApi => ({
    iban: normalizarIban(c.iban),
    descripcion: c.descripcion || undefined,
});

const cambiosCuentaBancariaAApi = (c: CambiosCuentaBancaria): CambiosCuentaBancariaApi => {
    const cambios: CambiosCuentaBancariaApi = {};
    if (c.codigoCuenta !== undefined) cambios["codigo_cuenta"] = c.codigoCuenta;
    if (c.paisId !== undefined) cambios["pais_id"] = c.paisId;
    if (c.obsoleta !== undefined) cambios["obsoleta"] = c.obsoleta;
    if (c.empresaId !== undefined) cambios["empresa_id"] = c.empresaId;
    if (c.descripcion !== undefined) cambios["descripcion"] = c.descripcion;
    if (c.iban !== undefined) cambios["iban"] = c.iban;
    if (c.bic !== undefined) cambios["bic"] = c.bic;
    if (c.entidad !== undefined) cambios["entidad"] = c.entidad;
    if (c.agencia !== undefined) cambios["agencia"] = c.agencia;
    if (c.digitoControl !== undefined) cambios["digito_control"] = c.digitoControl;
    if (c.cuenta !== undefined) cambios["cuenta"] = c.cuenta;
    return cambios;
};

export const getCuentaBancaria: GetCuentaBancaria = async (id) => {
    return await RestAPI.getItem<CuentaBancaria, CuentaBancariaApi>(
        `${baseUrl}/${id}`,
        cuentaBancariaDesdeApi,
    );
};

export const getCuentasBancarias: GetCuentasBancarias = async (criteria) => {
    return await RestAPI.getQuery<CuentaBancaria, CuentaBancariaApi>(
        baseUrl,
        criteria,
        cuentaBancariaDesdeApi,
    );
};

export const postCuentaBancaria: PostCuentaBancaria = async (nueva) => {
    const respuesta = await RestAPI.post<NuevaCuentaBancariaApi>(
        baseUrl,
        nuevaCuentaBancariaAApi(nueva),
        tTesoreria("cuentas_bancarias.errorAlCrearCuentaBancaria"),
    );
    return respuesta.id;
};

export const patchCuentaBancaria: PatchCuentaBancaria = async (id, cambios) => {
    await RestAPI.patch<CambiosCuentaBancariaApi>(
        `${baseUrl}/${id}`,
        cambiosCuentaBancariaAApi(cambios),
        tTesoreria("cuentas_bancarias.errorAlActualizarCuentaBancaria"),
    );
};

export const deleteCuentaBancaria: DeleteCuentaBancaria = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        tTesoreria("cuentas_bancarias.errorAlEliminarCuentaBancaria"),
    );
};
