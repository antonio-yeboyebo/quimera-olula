import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Tenant } from "../diseño.js";
import { getTenant, getTenants, migrarTodosTenants } from "../infraestructura.js";
import { ContextoMaestroTenant, EstadoMaestroTenant } from "./diseño.js";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroTenant, ContextoMaestroTenant>;

const conTenants = (fn: ProcesarListaActivaEntidades<Tenant>) =>
    (ctx: ContextoMaestroTenant) => ({ ...ctx, tenants: fn(ctx.tenants) });

export const Tenants = accionesListaActivaEntidades(conTenants);

export const recargarTenants: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getTenants(criteria);
    return Tenants.recargar(contexto, resultado);
};

export const ampliarTenants: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getTenants(criteria);
    return Tenants.ampliar(contexto, resultado);
};

export const incluirTenantCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const tenant = await getTenant(id);
    return {
        ...contexto,
        estado: "INICIAL",
        tenants: {
            ...contexto.tenants,
            lista: [tenant, ...contexto.tenants.lista],
            total: contexto.tenants.total + 1,
            activo: tenant.id,
        },
    };
};

/** Lanza la migración de todas las empresas y recarga la lista. */
export const migrarTodas: ProcesarMaestro = async (contexto) => {
    await migrarTodosTenants();
    const resultado = await getTenants(contexto.tenants.criteria);
    return Tenants.recargar({ ...contexto, estado: "INICIAL" }, resultado);
};
