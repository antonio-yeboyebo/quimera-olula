import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "../comun/urls.js";
import {
    AccesoSoporte, CambiosTenant, EstadoProvision, EstadoTenant, GetTenant, GetTenants, ModuloTenant,
    NuevoTenant, PatchTenant, PostTenant, Provision, Tenant, UsuarioSoporte, UsuariosSoporte,
} from "./diseño.js";

interface ModuloTenantApi {
    id: string;
    nombre: string;
    descripcion: string;
    depende_de: string[];
    es_base: boolean;
    activo: boolean;
}

interface ProvisionApi {
    id: string;
    tipo: string;
    estado: EstadoProvision;
    usuario_id: string;
    inicio: string;
    fin: string;
    log: string;
    error: string;
}

export interface TenantApi {
    id: string;
    nombre: string;
    nif: string;
    email_contacto: string;
    estado: EstadoTenant;
    fecha_alta: string;
    version_esquema: string;
    nombre_bd?: string;
    modulos?: ModuloTenantApi[];
    provisiones?: ProvisionApi[];
}

interface UsuarioSoporteApi {
    id: string;
    nombre: string;
    email: string;
    grupo: string;
    acceso_saas: boolean | null;
}

interface AccesoSoporteApi {
    id: string;
    usuario_id: string;
    accion: string;
    detalle: Record<string, unknown> | string | null;
    fecha: string;
}

const urls = new ApiUrls();
const baseUrl = urls.TENANT;

export const moduloTenantDesdeApi = (m: ModuloTenantApi): ModuloTenant => ({
    id: m.id,
    nombre: m.nombre,
    descripcion: m.descripcion ?? '',
    dependeDe: m.depende_de ?? [],
    esBase: !!m.es_base,
    activo: !!m.activo,
});

const provisionDesdeApi = (p: ProvisionApi): Provision => ({
    id: p.id,
    tipo: p.tipo,
    estado: p.estado,
    usuarioId: p.usuario_id ?? '',
    inicio: p.inicio ?? '',
    fin: p.fin ?? '',
    log: p.log ?? '',
    error: p.error ?? '',
});

export const tenantDesdeApi = (t: TenantApi): Tenant => ({
    id: t.id,
    nombre: t.nombre,
    nif: t.nif ?? '',
    emailContacto: t.email_contacto ?? '',
    estado: t.estado,
    fechaAlta: t.fecha_alta ?? '',
    versionEsquema: t.version_esquema ?? '',
    nombreBd: t.nombre_bd ?? '',
    modulos: (t.modulos ?? []).map(moduloTenantDesdeApi),
    provisiones: (t.provisiones ?? []).map(provisionDesdeApi),
});

const usuarioDesdeApi = (u: UsuarioSoporteApi): UsuarioSoporte => ({
    id: u.id,
    nombre: u.nombre ?? '',
    email: u.email ?? '',
    grupo: u.grupo ?? '',
    accesoSaas: u.acceso_saas ?? null,
});

/** El detalle llega como JSON (`{usuario, antes, despues}`): se muestra como texto. */
const detalleATexto = (detalle: AccesoSoporteApi['detalle']): string => {
    if (!detalle) return '';
    if (typeof detalle === 'string') return detalle;
    return Object.entries(detalle)
        .map(([clave, valor]) => `${clave}: ${typeof valor === 'object' ? JSON.stringify(valor) : String(valor)}`)
        .join(' · ');
};

const accesoDesdeApi = (a: AccesoSoporteApi): AccesoSoporte => ({
    id: a.id,
    usuarioId: a.usuario_id ?? '',
    accion: a.accion,
    detalle: detalleATexto(a.detalle),
    fecha: a.fecha,
});

const cambiosAApi = (c: CambiosTenant) => {
    const cambios: Record<string, unknown> = {};
    if (c.nombre !== undefined) cambios.nombre = c.nombre;
    if (c.nif !== undefined) cambios.nif = c.nif;
    if (c.emailContacto !== undefined) cambios.email_contacto = c.emailContacto;
    return { cambios };
};

/**
 * Algunas operaciones del backoffice responden 204 (sin cuerpo): RestAPI intenta
 * parsear JSON y falla con SyntaxError aunque la operación haya ido bien.
 * Los errores HTTP reales llegan como objeto { nombre, descripcion, estado }.
 */
const sinCuerpo = async (llamada: () => Promise<unknown>): Promise<void> => {
    try {
        await llamada();
    } catch (error) {
        if (error instanceof SyntaxError) return;
        throw error;
    }
};

export const getTenant: GetTenant = async (id) =>
    RestAPI.getItem<Tenant, TenantApi>(`${baseUrl}/${id}`, tenantDesdeApi);

export const getTenants: GetTenants = async (criteria) =>
    RestAPI.getQuery<Tenant, TenantApi>(baseUrl, criteria, tenantDesdeApi);

export const postTenant: PostTenant = async (nuevo: NuevoTenant) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        {
            id: nuevo.id,
            nombre: nuevo.nombre,
            nif: nuevo.nif,
            email_contacto: nuevo.emailContacto,
            administrador: {
                email: nuevo.adminEmail,
                nombre: nuevo.adminNombre,
                "contraseña": nuevo.adminContrasena,
            },
        },
        "Error al crear la empresa"
    );
    return respuesta.id;
};

export const patchTenant: PatchTenant = async (id, cambios) => {
    await sinCuerpo(() => RestAPI.patch(`${baseUrl}/${id}`, cambiosAApi(cambios), "Error al guardar la empresa"));
};

const accionTenant = async (id: string, accion: string, msgError: string) =>
    RestAPI.query<unknown, Record<string, unknown>>(`${baseUrl}/${id}/${accion}`, {}, msgError);

export const suspenderTenant = async (id: string): Promise<void> => {
    await accionTenant(id, "suspender", "Error al suspender la empresa");
};

export const reactivarTenant = async (id: string): Promise<void> => {
    await accionTenant(id, "reactivar", "Error al reactivar la empresa");
};

export const bajaTenant = async (id: string): Promise<void> => {
    await accionTenant(id, "baja", "Error al dar de baja la empresa");
};

export const migrarTenant = async (id: string): Promise<void> => {
    await accionTenant(id, "migrar", "Error al migrar la empresa");
};

export const migrarTodosTenants = async (): Promise<void> => {
    await RestAPI.query<unknown, Record<string, unknown>>(urls.MIGRACION, {}, "Error al lanzar la migración");
};

export const exportarTenant = async (id: string): Promise<string[]> => {
    const r = await accionTenant(id, "exportar", "Error al exportar la empresa");
    return (r.ficheros as string[]) ?? [];
};

export const getExportacion = async (id: string, fichero: string): Promise<Blob> =>
    RestAPI.blob(`${baseUrl}/${id}/exportacion/${encodeURIComponent(fichero)}`, "Error al descargar el fichero");

export const descargarBlob = (blob: Blob, nombre: string): void => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

export const deleteBdTenant = async (id: string): Promise<void> => {
    await sinCuerpo(() => RestAPI.delete(`${baseUrl}/${id}/bd`, "Error al eliminar la base de datos"));
};

// Módulos

export const getCatalogoModulos = async (): Promise<ModuloTenant[]> =>
    RestAPI.getLista<ModuloTenant, ModuloTenantApi>(urls.MODULO, moduloTenantDesdeApi);

export const activarModuloTenant = async (id: string, moduloId: string): Promise<void> => {
    await accionTenant(id, `modulo/${moduloId}`, "Error al activar el módulo");
};

export const desactivarModuloTenant = async (id: string, moduloId: string): Promise<void> => {
    await sinCuerpo(() => RestAPI.delete(`${baseUrl}/${id}/modulo/${moduloId}`, "Error al desactivar el módulo"));
};

// Soporte

export const getUsuariosSoporte = async (id: string): Promise<UsuariosSoporte> => {
    const r = await RestAPI.get<{ datos: UsuarioSoporteApi[]; grupos?: string[] }>(`${baseUrl}/${id}/usuario`);
    return { usuarios: r.datos.map(usuarioDesdeApi), grupos: r.grupos ?? [] };
};

export const patchAccesoUsuario = async (id: string, usuario: string, activo: boolean): Promise<void> => {
    await sinCuerpo(() => RestAPI.patch(`${baseUrl}/${id}/usuario/${usuario}/acceso`, { activo }, "Error al cambiar el acceso"));
};

export const patchGrupoUsuario = async (id: string, usuario: string, grupo: string): Promise<void> => {
    await sinCuerpo(() => RestAPI.patch(`${baseUrl}/${id}/usuario/${usuario}/grupo`, { grupo }, "Error al cambiar el grupo"));
};

export const patchContrasenaUsuario = async (id: string, usuario: string, contrasena: string): Promise<void> => {
    await sinCuerpo(() => RestAPI.patch(
        `${baseUrl}/${id}/usuario/${usuario}/contrasena`,
        { "contraseña": contrasena },
        "Error al cambiar la contraseña"
    ));
};

export const getAccesosSoporte = async (id: string): Promise<AccesoSoporte[]> =>
    RestAPI.getLista<AccesoSoporte, AccesoSoporteApi>(`${baseUrl}/${id}/acceso_soporte`, accesoDesdeApi);
