import ApiUrls from "#/contabilidad/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    CambiosCodigoBalance,
    CodigoBalance,
    CuentaCodigoBalance,
    DeleteCodigoBalance,
    DeleteCuentaCodigoBalance,
    FormatoBalance,
    GetCodigoBalance,
    GetCodigosBalance,
    GetCuentasCodigoBalance,
    NuevaCuentaCodigoBalance,
    NuevoCodigoBalance,
    PatchCodigoBalance,
    PatchCuentaCodigoBalance,
    PostCodigoBalance,
    PostCuentaCodigoBalance,
    PostRegenerarCodigosBalance,
} from "./diseño.ts";
import { criteriaCuentasDeCodigo } from "./dominio.ts";
import { tContabilidad } from "../i18n/index.ts";

const urls = new ApiUrls();
const baseUrl = urls.CODIGO_BALANCE;

const urlCuentas = (formato: FormatoBalance) =>
    formato === "abreviado"
        ? urls.CUENTA_CODIGO_BALANCE_ABREVIADO
        : urls.CUENTA_CODIGO_BALANCE;

const urlCodigo = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;

export interface CodigoBalanceApi {
    id: string;
    naturaleza: string;
    nivel1: string | null;
    descripcion1: string | null;
    nivel2: number | null;
    descripcion2: string | null;
    nivel3: string | null;
    orden3: string | null;
    descripcion3: string | null;
    nivel4: string | null;
    descripcion4: string | null;
    descripcion4ba: string | null;
}

export interface CuentaCodigoBalanceApi {
    id: number;
    formato: FormatoBalance;
    codigo_balance_id: string;
    codigo_cuenta: string;
    descripcion_cuenta: string | null;
    signo: string;
}

export const codigoBalanceDesdeApi = (api: CodigoBalanceApi): CodigoBalance => ({
    id: api.id,
    naturaleza: api.naturaleza ?? "",
    nivel1: api.nivel1 ?? "",
    descripcion1: api.descripcion1 ?? "",
    nivel2: api.nivel2 === null || api.nivel2 === undefined ? "" : String(api.nivel2),
    descripcion2: api.descripcion2 ?? "",
    nivel3: api.nivel3 ?? "",
    orden3: api.orden3 ?? "",
    descripcion3: api.descripcion3 ?? "",
    nivel4: api.nivel4 ?? "",
    descripcion4: api.descripcion4 ?? "",
    descripcion4ba: api.descripcion4ba ?? "",
});

const CAMPOS_TEXTO = [
    "naturaleza", "nivel1", "descripcion1", "descripcion2", "nivel3",
    "descripcion3", "nivel4", "descripcion4", "descripcion4ba",
] as const;

/** Vacío -> null, como deja Eneboo los niveles sin informar. */
export const cambiosCodigoBalanceAApi = (cambios: CambiosCodigoBalance) => {
    const api: Record<string, string | number | null> = {};
    for (const campo of CAMPOS_TEXTO) {
        const valor = cambios[campo];
        if (valor !== undefined) {
            api[campo] = valor.trim() === "" ? null : valor.trim();
        }
    }
    if (cambios.nivel2 !== undefined) {
        api.nivel2 = cambios.nivel2.trim() === "" ? null : Number(cambios.nivel2);
    }
    return api;
};

export const nuevoCodigoBalanceAApi = (nuevo: NuevoCodigoBalance) => {
    const { id, ...resto } = nuevo;
    return { id: id.trim(), ...cambiosCodigoBalanceAApi(resto as CambiosCodigoBalance) };
};

export const cuentaCodigoBalanceDesdeApi = (
    api: CuentaCodigoBalanceApi
): CuentaCodigoBalance => ({
    id: String(api.id),
    formato: api.formato,
    codigoBalanceId: api.codigo_balance_id,
    codigoCuenta: api.codigo_cuenta,
    descripcionCuenta: api.descripcion_cuenta ?? "",
    signo: api.signo ?? "Ambos",
});

export const cuentaCodigoBalanceAApi = (
    cuenta: Partial<NuevaCuentaCodigoBalance>
) => {
    const api: Record<string, string | null> = {};
    if (cuenta.codigoCuenta !== undefined) api.codigo_cuenta = cuenta.codigoCuenta.trim();
    if (cuenta.descripcionCuenta !== undefined) {
        api.descripcion_cuenta = cuenta.descripcionCuenta.trim() || null;
    }
    if (cuenta.signo !== undefined) api.signo = cuenta.signo;
    return api;
};

export const getCodigosBalance: GetCodigosBalance = async (criteria) =>
    RestAPI.getQuery<CodigoBalance, CodigoBalanceApi>(
        baseUrl, criteria, codigoBalanceDesdeApi
    );

export const getCodigoBalance: GetCodigoBalance = async (id) =>
    RestAPI.getItem<CodigoBalance, CodigoBalanceApi>(
        urlCodigo(id), codigoBalanceDesdeApi
    );

export const postCodigoBalance: PostCodigoBalance = async (nuevo) => {
    const respuesta = await RestAPI.post(
        baseUrl, nuevoCodigoBalanceAApi(nuevo), tContabilidad("codigo_balance.errorAlCrearElCodigoDe")
    );
    return String(respuesta.id);
};

export const patchCodigoBalance: PatchCodigoBalance = async (id, cambios) => {
    await RestAPI.patch(
        urlCodigo(id), cambiosCodigoBalanceAApi(cambios), tContabilidad("codigo_balance.errorAlGuardarElCodigoDe")
    );
};

export const deleteCodigoBalance: DeleteCodigoBalance = async (id) => {
    await RestAPI.delete(urlCodigo(id), tContabilidad("codigo_balance.errorAlBorrarElCodigoDe"));
};

export const postRegenerarCodigosBalance: PostRegenerarCodigosBalance = async (alcance) => {
    await RestAPI.post(
        urls.CODIGO_BALANCE_REGENERAR, { alcance }, tContabilidad("codigo_balance.errorAlRegenerarLosCodigosDe")
    );
};

export const getCuentasCodigoBalance: GetCuentasCodigoBalance = async (formato, codigoBalanceId) =>
    RestAPI.getQuery<CuentaCodigoBalance, CuentaCodigoBalanceApi>(
        urlCuentas(formato),
        criteriaCuentasDeCodigo(codigoBalanceId),
        cuentaCodigoBalanceDesdeApi
    );

export const postCuentaCodigoBalance: PostCuentaCodigoBalance = async (
    formato, codigoBalanceId, nueva
) => {
    const respuesta = await RestAPI.post(
        urlCuentas(formato),
        { codigo_balance_id: codigoBalanceId, ...cuentaCodigoBalanceAApi(nueva) },
        tContabilidad("codigo_balance.errorAlAsignarLaCuentaAl")
    );
    return String(respuesta.id);
};

export const patchCuentaCodigoBalance: PatchCuentaCodigoBalance = async (formato, id, cambios) => {
    await RestAPI.patch(
        `${urlCuentas(formato)}/${id}`,
        cuentaCodigoBalanceAApi(cambios),
        tContabilidad("codigo_balance.errorAlGuardarLaCuentaDel")
    );
};

export const deleteCuentaCodigoBalance: DeleteCuentaCodigoBalance = async (formato, id) => {
    await RestAPI.delete(
        `${urlCuentas(formato)}/${id}`,
        tContabilidad("codigo_balance.errorAlQuitarLaCuentaDel")
    );
};
