import { EstadoTenant, ModuloTenant, NuevoTenant, Tenant } from "./diseño.js";

export const idTenantValido = (id: string): boolean => /^[a-z][a-z0-9_]{1,39}$/.test(id);

export const tenantVacio = (): Tenant => ({
    id: '',
    nombre: '',
    nif: '',
    emailContacto: '',
    estado: 'pendiente_verificacion',
    fechaAlta: '',
    versionEsquema: '',
    nombreBd: '',
    modulos: [],
    provisiones: [],
});

export const nuevoTenantVacio: NuevoTenant = {
    id: '',
    nombre: '',
    nif: '',
    emailContacto: '',
    adminEmail: '',
    adminNombre: '',
    adminContrasena: '',
};

export const etiquetaEstadoTenant: Record<EstadoTenant, string> = {
    pendiente_verificacion: 'Pendiente de verificación',
    provisionando: 'Provisionando',
    activo: 'Activo',
    suspendido: 'Suspendido',
    baja: 'Baja',
    error: 'Error',
};

export const varianteEstadoTenant = (estado: EstadoTenant) => {
    switch (estado) {
        case 'activo': return 'exito';
        case 'suspendido': return 'advertencia';
        case 'error': return 'error';
        case 'provisionando': return 'primario';
        case 'pendiente_verificacion': return 'neutro';
        default: return 'gris';
    }
};

/** versionEsquema tiene el formato "aplicadas/disponibles". */
export const migracionesPendientes = (versionEsquema: string): boolean => {
    const [aplicadas, disponibles] = versionEsquema.split('/');
    return !!disponibles && aplicadas !== disponibles;
};

export const puedeSuspender = (t: Tenant) => t.estado === 'activo';
export const puedeReactivar = (t: Tenant) => t.estado === 'suspendido';
export const puedeEliminarBd = (t: Tenant) => t.estado === 'baja';
export const puedeDarDeBaja = (t: Tenant) => t.estado !== 'baja' && t.estado !== 'provisionando';

/** Módulos activos que dependen del indicado (impiden desactivarlo). */
export const dependientesActivos = (modulos: ModuloTenant[], id: string): ModuloTenant[] =>
    modulos.filter((m) => m.activo && m.dependeDe.includes(id));
