import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export type EstadoTenant =
    | 'pendiente_verificacion'
    | 'provisionando'
    | 'activo'
    | 'suspendido'
    | 'baja'
    | 'error';

export interface ModuloTenant {
    id: string;
    nombre: string;
    descripcion: string;
    dependeDe: string[];
    esBase: boolean;
    activo: boolean;
}

export type EstadoProvision = 'en_curso' | 'correcta' | 'error';

export interface Provision {
    id: string;
    tipo: string;
    estado: EstadoProvision;
    usuarioId: string;
    inicio: string;
    fin: string;
    log: string;
    error: string;
}

export interface UsuarioSoporte extends Entidad {
    id: string;
    nombre: string;
    email: string;
    grupo: string;
    accesoSaas: boolean | null;
}

export interface AccesoSoporte extends Entidad {
    id: string;
    usuarioId: string;
    accion: string;
    detalle: string;
    fecha: string;
}

export interface Tenant extends Entidad {
    id: string;
    nombre: string;
    nif: string;
    emailContacto: string;
    estado: EstadoTenant;
    fechaAlta: string;
    versionEsquema: string;
    nombreBd: string;
    modulos: ModuloTenant[];
    provisiones: Provision[];
}

export interface NuevoTenant extends Modelo {
    id: string;
    nombre: string;
    nif: string;
    emailContacto: string;
    adminEmail: string;
    adminNombre: string;
    adminContrasena: string;
}

export interface CambiosTenant {
    nombre?: string;
    nif?: string;
    emailContacto?: string;
}

export interface UsuariosSoporte {
    usuarios: UsuarioSoporte[];
    grupos: string[];
}

export interface NuevaContrasena extends Modelo {
    contrasena: string;
}

export type GetTenant = (id: string) => Promise<Tenant>;
export type GetTenants = (criteria: Criteria) => RespuestaLista<Tenant>;
export type PostTenant = (nuevo: NuevoTenant) => Promise<string>;
export type PatchTenant = (id: string, cambios: CambiosTenant) => Promise<void>;
