import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    GetPartidasSubcuenta,
    GetSubcuentasTercero,
    PartidaSubcuenta,
    SubcuentaTercero,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

export interface SubcuentaTerceroApi {
    id: number;
    ejercicio_id: string;
    subcuenta_id: number;
    codigo_subcuenta: string;
    descripcion: string;
    saldo: number;
}

export interface PartidaSubcuentaApi {
    id: number;
    asiento_id: number;
    numero_asiento: number;
    fecha: string;
    concepto: string;
    debe: number;
    haber: number;
    saldo: number;
}

export const urlSubcuentasTercero = (tipo: "cliente" | "proveedor", id: string) =>
    `/contabilidad/subcuentas_${tipo}/${encodeURIComponent(id)}`;

export const urlPartidasSubcuenta = (subcuentaId: string) =>
    `/contabilidad/subcuenta/${encodeURIComponent(subcuentaId)}/partida`;

export const subcuentaTerceroDesdeApi = (api: SubcuentaTerceroApi): SubcuentaTercero => ({
    id: String(api.id),
    ejercicioId: api.ejercicio_id,
    subcuentaId: String(api.subcuenta_id),
    codigoSubcuenta: api.codigo_subcuenta ?? "",
    descripcion: api.descripcion ?? "",
    saldo: Number(api.saldo ?? 0),
});

export const partidaSubcuentaDesdeApi = (api: PartidaSubcuentaApi): PartidaSubcuenta => ({
    id: String(api.id),
    asientoId: String(api.asiento_id),
    numeroAsiento: Number(api.numero_asiento),
    fecha: new Date(`${api.fecha}T12:00:00`),
    concepto: api.concepto ?? "",
    debe: Number(api.debe ?? 0),
    haber: Number(api.haber ?? 0),
    saldo: Number(api.saldo ?? 0),
});

export const getSubcuentasTercero: GetSubcuentasTercero = (tipo, terceroId) =>
    RestAPI.getLista<SubcuentaTercero, SubcuentaTerceroApi>(
        urlSubcuentasTercero(tipo, terceroId),
        subcuentaTerceroDesdeApi,
        tContabilidad("subcuentas_tercero.errorAlLeerLasSubcuentas")
    );

export const getPartidasSubcuenta: GetPartidasSubcuenta = (subcuentaId) =>
    RestAPI.getLista<PartidaSubcuenta, PartidaSubcuentaApi>(
        urlPartidasSubcuenta(subcuentaId),
        partidaSubcuentaDesdeApi,
        tContabilidad("subcuentas_tercero.errorAlLeerLasPartidas")
    );
