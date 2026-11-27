import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "@olula/lib/api/urls.ts";
import {
    CambiosDivisa,
    DeleteDivisa,
    Divisa,
    GetDivisa,
    GetDivisasMaestro,
    NuevaDivisa,
    PatchDivisa,
    PostDivisa,
} from "./diseño.ts";
import { tComun } from "../i18n/index.ts";

const baseUrl = ApiUrls.COMUN_DIVISA;

const urlDivisa = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;

const dosCifras = (n: number) => String(n).padStart(2, "0");

export const fechaAApi = (fecha: Date): string =>
    `${fecha.getFullYear()}-${dosCifras(fecha.getMonth() + 1)}-${dosCifras(fecha.getDate())}`;

const fechaDesdeApi = (fecha: string | null): Date | null =>
    fecha ? new Date(`${fecha.slice(0, 10)}T12:00:00`) : null;

export interface DivisaApi {
    id: string;
    descripcion: string | null;
    tasa_conversion: number;
    fecha: string | null;
    codigo_iso: string | null;
    simbolo: string | null;
    monedas_billetes: string | null;
    cifras_decimales: number | null;
}

export const divisaDesdeApi = (api: DivisaApi): Divisa => ({
    id: api.id,
    descripcion: api.descripcion ?? "",
    tasaConversion: Number(api.tasa_conversion ?? 1),
    fecha: fechaDesdeApi(api.fecha),
    codigoIso: api.codigo_iso ?? "",
    simbolo: api.simbolo ?? "",
    monedasBilletes: api.monedas_billetes ?? "",
    cifrasDecimales: Number(api.cifras_decimales ?? 2),
});

const textoONull = (valor: string) => valor.trim() || null;

export const cambiosDivisaAApi = (cambios: CambiosDivisa) => {
    const api: Record<string, unknown> = {};
    if (cambios.descripcion !== undefined) api.descripcion = textoONull(cambios.descripcion);
    if (cambios.tasaConversion !== undefined) api.tasa_conversion = Number(cambios.tasaConversion);
    if (cambios.fecha !== undefined) api.fecha = cambios.fecha ? fechaAApi(new Date(cambios.fecha)) : null;
    if (cambios.codigoIso !== undefined) api.codigo_iso = textoONull(cambios.codigoIso);
    if (cambios.simbolo !== undefined) api.simbolo = textoONull(cambios.simbolo);
    if (cambios.monedasBilletes !== undefined) api.monedas_billetes = cambios.monedasBilletes || null;
    if (cambios.cifrasDecimales !== undefined) api.cifras_decimales = Number(cambios.cifrasDecimales);
    return api;
};

export const nuevaDivisaAApi = (nueva: NuevaDivisa) => {
    const { id, ...resto } = nueva;
    return { id: id.trim().toUpperCase(), ...cambiosDivisaAApi(resto) };
};

export const getDivisasMaestro: GetDivisasMaestro = async (criteria) =>
    RestAPI.getQuery<Divisa, DivisaApi>(baseUrl, criteria, divisaDesdeApi);

export const getDivisa: GetDivisa = async (id) => RestAPI.getItem<Divisa, DivisaApi>(urlDivisa(id), divisaDesdeApi);

export const postDivisa: PostDivisa = async (nueva) => {
    const respuesta = await RestAPI.post(baseUrl, nuevaDivisaAApi(nueva), tComun("divisas.errorAlCrearLaDivisa"));
    return String(respuesta.id);
};

export const patchDivisa: PatchDivisa = async (id, cambios) => {
    await RestAPI.patch(urlDivisa(id), cambiosDivisaAApi(cambios), tComun("divisas.errorAlGuardarLaDivisa"));
};

export const deleteDivisa: DeleteDivisa = async (id) => {
    await RestAPI.delete(urlDivisa(id), tComun("divisas.errorAlBorrarLaDivisa"));
};
