import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { Tenant, UsuarioSoporte } from "../diseño.js";
import { tenantVacio } from "../dominio.js";
import {
    activarModuloTenant, desactivarModuloTenant, descargarBlob, exportarTenant, getAccesosSoporte,
    getExportacion, getTenant, getUsuariosSoporte, migrarTenant, patchAccesoUsuario,
    patchGrupoUsuario, patchTenant, reactivarTenant, suspenderTenant,
} from "../infraestructura.js";
import { ContextoDetalleTenant, EstadoDetalleTenant } from "./diseño.js";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleTenant, ContextoDetalleTenant>;

const pipeTenant = ejecutarListaProcesos<EstadoDetalleTenant, ContextoDetalleTenant>;

export const metaTenant: MetaModelo<Tenant> = {
    campos: {
        nombre: { requerido: true, minimo: 2 },
        nif: { requerido: false },
        emailContacto: { requerido: false },
    },
    editable: (t: Tenant) => t.estado !== 'baja',
};

export const contextoDetalleTenantInicial: ContextoDetalleTenant = {
    estado: 'INICIAL',
    tenant: tenantVacio(),
    usuarios: [],
    grupos: [],
    accesos: [],
    usuarioContrasena: null,
};

/** Refresca la cabecera y propaga el cambio al maestro. */
export const refrescarTenant: ProcesarDetalle = async (contexto) => {
    const tenant = await getTenant(contexto.tenant.id);
    return [
        { ...contexto, tenant },
        [["tenant_cambiado", tenant]],
    ];
};

/** El soporte (usuarios/auditoría) solo existe cuando hay base de datos operativa. */
const conSoporte = (t: Tenant) => t.estado === 'activo' || t.estado === 'suspendido';

export const refrescarUsuarios: ProcesarDetalle = async (contexto) => {
    if (!conSoporte(contexto.tenant)) return { ...contexto, usuarios: [], grupos: [] };
    try {
        const { usuarios, grupos } = await getUsuariosSoporte(contexto.tenant.id);
        return { ...contexto, usuarios, grupos };
    } catch {
        return { ...contexto, usuarios: [], grupos: [] };
    }
};

export const refrescarAccesos: ProcesarDetalle = async (contexto) => {
    if (!conSoporte(contexto.tenant)) return { ...contexto, accesos: [] };
    try {
        return { ...contexto, accesos: await getAccesosSoporte(contexto.tenant.id) };
    } catch {
        return { ...contexto, accesos: [] };
    }
};

export const guardarTenant = async (contexto: ContextoDetalleTenant, tenant: Tenant): Promise<void> => {
    const actual = contexto.tenant;
    if (tenant.nombre !== actual.nombre ||
        tenant.nif !== actual.nif ||
        tenant.emailContacto !== actual.emailContacto) {
        await patchTenant(tenant.id, {
            nombre: tenant.nombre,
            nif: tenant.nif,
            emailContacto: tenant.emailContacto,
        });
    }
};

export const cargarTenant: (_: string) => ProcesarDetalle =
    (id) => async (contexto) => {
        const tenant = await getTenant(id);
        return pipeTenant(contexto, [
            async (ctx) => ({ ...ctx, tenant }),
            refrescarUsuarios,
            refrescarAccesos,
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (id) {
        return cargarTenant(id)(contexto);
    }
    return { ...contextoDetalleTenantInicial };
};

/** Refresco periódico mientras la empresa se provisiona. */
export const sondearTenant: ProcesarDetalle = async (contexto) => {
    const antes = contexto.tenant.estado;
    const tenant = await getTenant(contexto.tenant.id);
    const ctx = { ...contexto, tenant };
    if (tenant.estado === antes) return ctx;
    return pipeTenant(ctx, [
        refrescarUsuarios,
        refrescarAccesos,
        async (c) => [c, [["tenant_cambiado", tenant]]],
    ]);
};

const tras = (accion: (id: string) => Promise<unknown>): ProcesarDetalle =>
    async (contexto, payload) => {
        await accion(contexto.tenant.id);
        return pipeTenant(contexto, [refrescarTenant, refrescarUsuarios], payload);
    };

export const suspender = tras(suspenderTenant);
export const reactivar = tras(reactivarTenant);
export const migrar = tras(migrarTenant);

export const exportar: ProcesarDetalle = async (contexto) => {
    const id = contexto.tenant.id;
    const ficheros = await exportarTenant(id);
    for (const fichero of ficheros) {
        const blob = await getExportacion(id, fichero);
        descargarBlob(blob, fichero);
    }
    return contexto;
};

// Módulos

const trasModulo = (
    accion: (idTenant: string, idModulo: string) => Promise<unknown>
): ProcesarDetalle => async (contexto, payload) => {
    await accion(contexto.tenant.id, payload as string);
    return refrescarTenant(contexto);
};

export const activarModulo = trasModulo(activarModuloTenant);
export const desactivarModulo = trasModulo(desactivarModuloTenant);

// Soporte

export const bloquearUsuario: ProcesarDetalle = async (contexto, payload) => {
    const { id, activo } = payload as { id: string; activo: boolean };
    await patchAccesoUsuario(contexto.tenant.id, id, activo);
    return pipeTenant(contexto, [refrescarUsuarios, refrescarAccesos]);
};

export const cambiarGrupoUsuario: ProcesarDetalle = async (contexto, payload) => {
    const { id, grupo } = payload as { id: string; grupo: string };
    await patchGrupoUsuario(contexto.tenant.id, id, grupo);
    return pipeTenant(contexto, [refrescarUsuarios, refrescarAccesos]);
};

export const solicitarContrasena: ProcesarDetalle = async (contexto, payload) => ({
    ...contexto,
    estado: 'CAMBIANDO_CONTRASENA',
    usuarioContrasena: payload as UsuarioSoporte,
});

export const contrasenaCambiada: ProcesarDetalle = async (contexto) =>
    pipeTenant(contexto, [
        async (ctx) => ({ ...ctx, usuarioContrasena: null }),
        refrescarAccesos,
        'ABIERTO',
    ]);
