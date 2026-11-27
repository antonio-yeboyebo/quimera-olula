import ApiUrls from "#/tesoreria/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    Banco,
    CambiosBanco,
    CambiosSucursal,
    DeleteBanco,
    DeleteSucursal,
    GetBanco,
    GetBancos,
    NuevoBanco,
    PatchBanco,
    PatchSucursal,
    PostBanco,
    PostSucursal,
    Sucursal,
} from "./diseño.ts";
import { tTesoreria } from "../i18n/index.ts";

const baseUrl = new ApiUrls().BANCO;

const urlBanco = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;
const urlSucursales = (bancoId: string) => `${urlBanco(bancoId)}/sucursal`;
const urlSucursal = (bancoId: string, id: string) =>
    `${urlSucursales(bancoId)}/${encodeURIComponent(id)}`;

export type SucursalApi = {
    id: number;
    agencia: string;
    nombre: string | null;
    direccion: string | null;
    codigo_postal: string | null;
    apartado: string | null;
    poblacion: string | null;
    provincia_id: number | null;
    provincia: string | null;
    pais_id: string | null;
    telefono: string | null;
    fax: string | null;
    contacto: string | null;
    observaciones: string | null;
};

export interface BancoApi {
    id: string;
    nombre: string;
    proveedor_id: string | null;
    nombre_proveedor: string | null;
    bic_defecto: string | null;
    sucursales?: SucursalApi[];
}

export const sucursalDesdeApi = (api: SucursalApi): Sucursal => ({
    id: String(api.id),
    agencia: api.agencia ?? "",
    nombre: api.nombre ?? "",
    direccion: api.direccion ?? "",
    codigoPostal: api.codigo_postal ?? "",
    apartado: api.apartado ?? "",
    poblacion: api.poblacion ?? "",
    provincia: api.provincia ?? "",
    paisId: api.pais_id ?? "",
    telefono: api.telefono ?? "",
    fax: api.fax ?? "",
    contacto: api.contacto ?? "",
    observaciones: api.observaciones ?? "",
});

export const bancoDesdeApi = (api: BancoApi): Banco => ({
    id: api.id,
    nombre: api.nombre ?? "",
    proveedorId: api.proveedor_id ?? "",
    nombreProveedor: api.nombre_proveedor ?? "",
    bicDefecto: api.bic_defecto ?? "",
    sucursales: (api.sucursales ?? []).map(sucursalDesdeApi),
});

const textoONull = (valor: string) => valor.trim() || null;

export const cambiosBancoAApi = (cambios: CambiosBanco) => {
    const api: Record<string, string | null> = {};
    if (cambios.nombre !== undefined) api.nombre = cambios.nombre.trim();
    if (cambios.proveedorId !== undefined) api.proveedor_id = textoONull(cambios.proveedorId);
    if (cambios.bicDefecto !== undefined) api.bic_defecto = textoONull(cambios.bicDefecto);
    return api;
};

const CAMPOS_SUCURSAL_API: [keyof CambiosSucursal, string][] = [
    ["agencia", "agencia"],
    ["nombre", "nombre"],
    ["direccion", "direccion"],
    ["codigoPostal", "codigo_postal"],
    ["apartado", "apartado"],
    ["poblacion", "poblacion"],
    ["provincia", "provincia"],
    ["paisId", "pais_id"],
    ["telefono", "telefono"],
    ["fax", "fax"],
    ["contacto", "contacto"],
    ["observaciones", "observaciones"],
];

export const cambiosSucursalAApi = (cambios: CambiosSucursal) => {
    const api: Record<string, string | null> = {};
    for (const [campo, campoApi] of CAMPOS_SUCURSAL_API) {
        const valor = cambios[campo];
        if (valor !== undefined) api[campoApi] = textoONull(valor);
    }
    if (api.agencia === null) api.agencia = "";
    return api;
};

export const nuevoBancoAApi = (nuevo: NuevoBanco) => {
    const { id, ...resto } = nuevo;
    return { id: id.trim(), ...cambiosBancoAApi(resto) };
};

export const getBancos: GetBancos = async (criteria) =>
    RestAPI.getQuery<Banco, BancoApi>(baseUrl, criteria, bancoDesdeApi);

export const getBanco: GetBanco = async (id) =>
    RestAPI.getItem<Banco, BancoApi>(urlBanco(id), bancoDesdeApi);

export const postBanco: PostBanco = async (nuevo) => {
    const respuesta = await RestAPI.post(baseUrl, nuevoBancoAApi(nuevo), tTesoreria("banco.errorAlCrearElBanco"));
    return String(respuesta.id);
};

export const patchBanco: PatchBanco = async (id, cambios) => {
    await RestAPI.patch(urlBanco(id), cambiosBancoAApi(cambios), tTesoreria("banco.errorAlGuardarElBanco"));
};

export const deleteBanco: DeleteBanco = async (id) => {
    await RestAPI.delete(urlBanco(id), tTesoreria("banco.errorAlBorrarElBanco"));
};

export const postSucursal: PostSucursal = async (bancoId, nueva) => {
    const respuesta = await RestAPI.post(
        urlSucursales(bancoId), cambiosSucursalAApi(nueva), tTesoreria("banco.errorAlCrearLaSucursal")
    );
    return String(respuesta.id);
};

export const patchSucursal: PatchSucursal = async (bancoId, sucursalId, cambios) => {
    await RestAPI.patch(
        urlSucursal(bancoId, sucursalId), cambiosSucursalAApi(cambios), tTesoreria("banco.errorAlGuardarLaSucursal")
    );
};

export const deleteSucursal: DeleteSucursal = async (bancoId, sucursalId) => {
    await RestAPI.delete(urlSucursal(bancoId, sucursalId), tTesoreria("banco.errorAlBorrarLaSucursal"));
};
