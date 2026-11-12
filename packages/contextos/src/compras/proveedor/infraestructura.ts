import { empresaActual } from "#/valores/empresaActual.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { normalizarIban } from "@olula/lib/iban.ts";
import ApiUrls from "../comun/urls.ts";
import {
    AsignarCuentaPago,
    CambiosCuentaBancoProveedor,
    CambiosDireccionProveedor,
    CambiosProveedor,
    CuentaBancoProveedor,
    DeleteCuentaBancoProveedor,
    DeleteDireccionProveedor,
    DeleteProveedor,
    DireccionProveedor,
    GetCuentaBancoProveedor,
    GetCuentasBancoProveedor,
    GetDireccionesProveedor,
    GetDireccionProveedor,
    GetProveedor,
    GetProveedores,
    MarcarDireccionPrincipal,
    NuevaCuentaBancoProveedor,
    NuevaDireccionProveedor,
    NuevoProveedor,
    PatchCuentaBancoProveedor,
    PatchDireccionProveedor,
    PatchProveedor,
    PostCuentaBancoProveedor,
    PostDireccionProveedor,
    PostProveedor,
    Proveedor,
    TipoIdFiscal,
} from "./diseño.ts";

const baseUrl = new ApiUrls().PROVEEDOR;

export interface ProveedorApi {
    id: string;
    nombre: string;
    nombre_comercial: string | null;
    id_fiscal: string;
    tipo_id_fiscal: string;
    divisa_id: string | null;
    serie_id: string | null;
    grupo_iva_negocio_id: string;
    forma_pago_id: string | null;
    contacto_id: string | null;
    telefono1: string | null;
    telefono2: string | null;
    email: string | null;
    web: string | null;
    observaciones: string | null;
    fecha_baja: string | null;
    de_baja: boolean;
    subcuenta_codigo: string | null;
    subcuenta_id: number | null;
    cuenta_pago_id: string | null;
    cuenta_pago: string | null;
    forma_pago: string | null;
    divisa: string | null;
    serie: string | null;
}

interface NuevoProveedorApi {
    nombre: string;
    id_fiscal: string;
    tipo_id_fiscal: string;
    empresa_id: string;
    direccion?: Omit<DireccionApi, "pais">;
}

interface CambiosProveedorApi {
    nombre?: string;
    nombre_comercial?: string | null;
    id_fiscal?: { id: string; tipo: string };
    divisa_id?: string | null;
    serie_id?: string | null;
    grupo_iva_negocio_id?: string | null;
    forma_pago_id?: string | null;
    telefono1?: string | null;
    telefono2?: string | null;
    email?: string | null;
    web?: string | null;
    observaciones?: string | null;
    fecha_baja?: string | null;
    contacto_id?: string | null;
    subcuenta_codigo?: string | null;
    subcuenta_id?: number | null;
    de_baja?: boolean | null;
}

interface DireccionApi {
    nombre_via: string;
    tipo_via: string | null;
    numero: string | null;
    otros: string | null;
    cod_postal: string | null;
    ciudad: string;
    provincia_id: string | null;
    provincia: string | null;
    pais_id: string | null;
    pais: string | null;
    apartado: string | null;
    telefono: string | null;
}

export interface DireccionProveedorApi {
    id: number | string;
    direccion: DireccionApi;
    principal: boolean;
}

interface CuentaBancoApi {
    descripcion: string;
    iban: string;
    bic: string | null;
    codigo_cuenta: string;
    pais_id: string;
    entidad: string | null;
    agencia: string | null;
    digito_control: string | null;
    cuenta: string | null;
}

export interface CuentaBancoProveedorApi {
    id: string;
    cuenta: CuentaBancoApi;
}

const fechaAApi = (fecha: Date | null): string | null =>
    fecha ? fecha.toISOString().slice(0, 10) : null;

export const proveedorDesdeApi = (api: ProveedorApi): Proveedor => ({
    id: api.id,
    nombre: api.nombre,
    nombreComercial: api.nombre_comercial,
    idFiscal: api.id_fiscal,
    tipoIdFiscal: api.tipo_id_fiscal as TipoIdFiscal,
    divisaId: api.divisa_id,
    serieId: api.serie_id,
    grupoIvaNegocioId: api.grupo_iva_negocio_id,
    formaPagoId: api.forma_pago_id,
    contactoId: api.contacto_id,
    telefono1: api.telefono1,
    telefono2: api.telefono2,
    email: api.email,
    web: api.web,
    observaciones: api.observaciones,
    fechaBaja: api.fecha_baja ? new Date(Date.parse(api.fecha_baja)) : null,
    deBaja: api.de_baja,
    subcuentaCodigo: api.subcuenta_codigo,
    subcuentaId: api.subcuenta_id,
    cuentaPagoId: api.cuenta_pago_id,
    cuentaPago: api.cuenta_pago,
    formaPago: api.forma_pago,
    divisa: api.divisa,
    serie: api.serie,
});

const nuevoProveedorAApi = (p: NuevoProveedor): NuevoProveedorApi => ({
    nombre: p.nombre,
    id_fiscal: p.idFiscal,
    tipo_id_fiscal: p.tipoIdFiscal,
    empresa_id: empresaActual(),
    ...(p.direccion ? { direccion: direccionAApi(p.direccion) } : {}),
});

const cambiosProveedorAApi = (p: CambiosProveedor): CambiosProveedorApi => {
    const cambios: CambiosProveedorApi = {};
    if (p.nombre !== undefined) cambios.nombre = p.nombre;
    if (p.nombreComercial !== undefined) cambios.nombre_comercial = p.nombreComercial;
    if (p.idFiscal !== undefined || p.tipoIdFiscal !== undefined) {
        cambios.id_fiscal = { id: p.idFiscal ?? "", tipo: p.tipoIdFiscal ?? "" };
    }
    if (p.divisaId !== undefined) cambios.divisa_id = p.divisaId;
    if (p.serieId !== undefined) cambios.serie_id = p.serieId;
    if (p.grupoIvaNegocioId !== undefined) cambios.grupo_iva_negocio_id = p.grupoIvaNegocioId;
    if (p.formaPagoId !== undefined) cambios.forma_pago_id = p.formaPagoId;
    if (p.telefono1 !== undefined) cambios.telefono1 = p.telefono1;
    if (p.telefono2 !== undefined) cambios.telefono2 = p.telefono2;
    if (p.email !== undefined) cambios.email = p.email;
    if (p.web !== undefined) cambios.web = p.web;
    if (p.observaciones !== undefined) cambios.observaciones = p.observaciones;
    if (p.fechaBaja !== undefined) cambios.fecha_baja = fechaAApi(p.fechaBaja);
    if (p.contactoId !== undefined) cambios.contacto_id = p.contactoId;
    if (p.subcuentaCodigo !== undefined) cambios.subcuenta_codigo = p.subcuentaCodigo;
    if (p.subcuentaId !== undefined) cambios.subcuenta_id = p.subcuentaId;
    if (p.deBaja !== undefined) cambios.de_baja = p.deBaja;
    return cambios;
};

export const direccionProveedorDesdeApi = (api: DireccionProveedorApi): DireccionProveedor => ({
    id: String(api.id),
    principal: api.principal,
    nombreVia: api.direccion.nombre_via,
    tipoVia: api.direccion.tipo_via,
    numero: api.direccion.numero,
    otros: api.direccion.otros,
    codPostal: api.direccion.cod_postal,
    ciudad: api.direccion.ciudad,
    provinciaId: api.direccion.provincia_id,
    provincia: api.direccion.provincia,
    paisId: api.direccion.pais_id,
    pais: api.direccion.pais,
    apartado: api.direccion.apartado,
    telefono: api.direccion.telefono,
});

const direccionAApi = (
    d: NuevaDireccionProveedor | CambiosDireccionProveedor
): Omit<DireccionApi, "pais"> => ({
    nombre_via: (d.nombreVia as string) ?? "",
    tipo_via: (d.tipoVia as string) ?? null,
    numero: (d.numero as string) ?? null,
    otros: (d.otros as string) ?? null,
    cod_postal: (d.codPostal as string) ?? null,
    ciudad: (d.ciudad as string) ?? "",
    provincia_id: (d.provinciaId as string) ?? null,
    provincia: (d.provincia as string) ?? null,
    pais_id: (d.paisId as string) ?? null,
    apartado: (d.apartado as string) ?? null,
    telefono: (d.telefono as string) ?? null,
});

export const cuentaBancoProveedorDesdeApi = (api: CuentaBancoProveedorApi): CuentaBancoProveedor => ({
    id: api.id,
    descripcion: api.cuenta.descripcion,
    iban: api.cuenta.iban,
    bic: api.cuenta.bic,
    codigoCuenta: api.cuenta.codigo_cuenta,
    paisId: api.cuenta.pais_id,
    entidad: api.cuenta.entidad,
    agencia: api.cuenta.agencia,
    digitoControl: api.cuenta.digito_control,
    cuenta: api.cuenta.cuenta,
});

const cuentaBancoAApi = (
    c: NuevaCuentaBancoProveedor | CambiosCuentaBancoProveedor
) => ({
    descripcion: (c.descripcion as string) ?? "",
    cuenta: {
        iban: normalizarIban((c.iban as string) ?? ""),
        bic: (c.bic as string) ?? null,
    },
});

export const getProveedor: GetProveedor = async (id) =>
    await RestAPI.getItem<Proveedor, ProveedorApi>(
        `${baseUrl}/${id}`,
        proveedorDesdeApi,
        "Error al obtener el proveedor"
    );

export const getProveedores: GetProveedores = async (criteria) =>
    await RestAPI.getQuery<Proveedor, ProveedorApi>(
        baseUrl,
        criteria,
        proveedorDesdeApi,
        "Error al obtener los proveedores"
    );

export const postProveedor: PostProveedor = async (nuevoProveedor) => {
    const respuesta = await RestAPI.post<NuevoProveedorApi>(
        baseUrl,
        nuevoProveedorAApi(nuevoProveedor),
        "Error al crear el proveedor"
    );
    return respuesta.id;
};

export const patchProveedor: PatchProveedor = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        { cambios: cambiosProveedorAApi(cambios) },
        "Error al guardar el proveedor"
    );
};

export const deleteProveedor: DeleteProveedor = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, "Error al borrar el proveedor");
};

export const getDireccionesProveedor: GetDireccionesProveedor = async (id) =>
    await RestAPI.getLista<DireccionProveedor, DireccionProveedorApi>(
        `${baseUrl}/${id}/direccion`,
        direccionProveedorDesdeApi,
        "Error al obtener las direcciones del proveedor"
    );

export const getDireccionProveedor: GetDireccionProveedor = async (id, direccionId) =>
    await RestAPI.getItem<DireccionProveedor, DireccionProveedorApi>(
        `${baseUrl}/${id}/direccion/${direccionId}`,
        direccionProveedorDesdeApi,
        "Error al obtener la dirección"
    );

export const postDireccionProveedor: PostDireccionProveedor = async (id, direccion) => {
    const respuesta = await RestAPI.post(
        `${baseUrl}/${id}/direccion`,
        { direccion: direccionAApi(direccion) },
        "Error al crear la dirección"
    );
    return String(respuesta.id);
};

export const patchDireccionProveedor: PatchDireccionProveedor = async (id, direccionId, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/direccion/${direccionId}`,
        { direccion: direccionAApi(cambios) },
        "Error al actualizar la dirección"
    );
};

export const marcarDireccionPrincipal: MarcarDireccionPrincipal = async (id, direccionId) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/direccion/${direccionId}/principal`,
        {},
        "Error al marcar la dirección como principal"
    );
};

export const deleteDireccionProveedor: DeleteDireccionProveedor = async (id, direccionId) => {
    await RestAPI.delete(
        `${baseUrl}/${id}/direccion/${direccionId}`,
        "Error al borrar la dirección"
    );
};

export const getCuentasBancoProveedor: GetCuentasBancoProveedor = async (id) =>
    await RestAPI.getLista<CuentaBancoProveedor, CuentaBancoProveedorApi>(
        `${baseUrl}/${id}/cuenta_banco`,
        cuentaBancoProveedorDesdeApi,
        "Error al obtener las cuentas bancarias del proveedor"
    );

export const getCuentaBancoProveedor: GetCuentaBancoProveedor = async (id, cuentaId) =>
    await RestAPI.getItem<CuentaBancoProveedor, CuentaBancoProveedorApi>(
        `${baseUrl}/${id}/cuenta_banco/${cuentaId}`,
        cuentaBancoProveedorDesdeApi,
        "Error al obtener la cuenta bancaria"
    );

export const postCuentaBancoProveedor: PostCuentaBancoProveedor = async (id, cuenta) => {
    const respuesta = await RestAPI.post(
        `${baseUrl}/${id}/cuenta_banco`,
        cuentaBancoAApi(cuenta),
        "Error al crear la cuenta bancaria"
    );
    return respuesta.id;
};

export const patchCuentaBancoProveedor: PatchCuentaBancoProveedor = async (id, cuentaId, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/cuenta_banco/${cuentaId}`,
        cuentaBancoAApi(cambios),
        "Error al actualizar la cuenta bancaria"
    );
};

export const deleteCuentaBancoProveedor: DeleteCuentaBancoProveedor = async (id, cuentaId) => {
    await RestAPI.delete(
        `${baseUrl}/${id}/cuenta_banco/${cuentaId}`,
        "Error al borrar la cuenta bancaria"
    );
};

export const asignarCuentaPago: AsignarCuentaPago = async (id, cuentaId) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/cuenta_pago`,
        { cuenta_id: cuentaId },
        "Error al asignar la cuenta de pago"
    );
};
