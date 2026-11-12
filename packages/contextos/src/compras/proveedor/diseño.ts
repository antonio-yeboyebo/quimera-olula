import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export type TipoIdFiscal = 'NIF' | 'NIFIVA' | 'PASAPORTE' | 'OTRO';

export interface Proveedor extends Entidad {
    id: string;
    nombre: string;
    nombreComercial: string | null;
    idFiscal: string;
    tipoIdFiscal: TipoIdFiscal;
    divisaId: string | null;
    serieId: string | null;
    grupoIvaNegocioId: string;
    formaPagoId: string | null;
    contactoId: string | null;
    telefono1: string | null;
    telefono2: string | null;
    email: string | null;
    web: string | null;
    observaciones: string | null;
    fechaBaja: Date | null;
    deBaja: boolean;
    subcuentaCodigo: string | null;
    subcuentaId: number | null;
    cuentaPagoId: string | null;
    cuentaPago: string | null;
    formaPago: string | null;
    divisa: string | null;
    serie: string | null;
}

export interface NuevoProveedor extends Modelo {
    nombre: string;
    idFiscal: string;
    tipoIdFiscal: TipoIdFiscal;
    direccion?: NuevaDireccionProveedor;
}

export type CambiosProveedor = Partial<Proveedor>;

export interface DireccionProveedor extends Entidad {
    id: string;
    principal: boolean;
    nombreVia: string;
    tipoVia: string | null;
    numero: string | null;
    otros: string | null;
    codPostal: string | null;
    ciudad: string;
    provinciaId: string | null;
    provincia: string | null;
    paisId: string | null;
    pais: string | null;
    apartado: string | null;
    telefono: string | null;
}

export interface NuevaDireccionProveedor extends Modelo {
    nombreVia: string;
    tipoVia: string | null;
    numero: string | null;
    otros: string | null;
    codPostal: string | null;
    ciudad: string;
    provinciaId: string | null;
    provincia: string | null;
    paisId: string | null;
    pais: string | null;
    apartado: string | null;
    telefono: string | null;
}

export type CambiosDireccionProveedor = Partial<DireccionProveedor>;

export interface CuentaBancoProveedor extends Entidad {
    id: string;
    descripcion: string;
    iban: string;
    bic: string | null;
    codigoCuenta: string;
    paisId: string;
    entidad: string | null;
    agencia: string | null;
    digitoControl: string | null;
    cuenta: string | null;
}

export interface NuevaCuentaBancoProveedor extends Modelo {
    descripcion: string;
    iban: string;
    bic: string | null;
}

export type CambiosCuentaBancoProveedor = Partial<CuentaBancoProveedor>;

export type GetProveedor = (id: string) => Promise<Proveedor>;
export type GetProveedores = (criteria: Criteria) => RespuestaLista<Proveedor>;
export type PostProveedor = (nuevoProveedor: NuevoProveedor) => Promise<string>;
export type PatchProveedor = (id: string, cambios: CambiosProveedor) => Promise<void>;
export type DeleteProveedor = (id: string) => Promise<void>;

export type GetDireccionesProveedor = (id: string) => Promise<DireccionProveedor[]>;
export type GetDireccionProveedor = (id: string, direccionId: string) => Promise<DireccionProveedor>;
export type PostDireccionProveedor = (id: string, direccion: NuevaDireccionProveedor) => Promise<string>;
export type PatchDireccionProveedor = (id: string, direccionId: string, cambios: CambiosDireccionProveedor) => Promise<void>;
export type MarcarDireccionPrincipal = (id: string, direccionId: string) => Promise<void>;
export type DeleteDireccionProveedor = (id: string, direccionId: string) => Promise<void>;

export type GetCuentasBancoProveedor = (id: string) => Promise<CuentaBancoProveedor[]>;
export type GetCuentaBancoProveedor = (id: string, cuentaId: string) => Promise<CuentaBancoProveedor>;
export type PostCuentaBancoProveedor = (id: string, cuenta: NuevaCuentaBancoProveedor) => Promise<string>;
export type PatchCuentaBancoProveedor = (id: string, cuentaId: string, cambios: CambiosCuentaBancoProveedor) => Promise<void>;
export type DeleteCuentaBancoProveedor = (id: string, cuentaId: string) => Promise<void>;
export type AsignarCuentaPago = (id: string, cuentaId: string | null) => Promise<void>;
