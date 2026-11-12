import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Tenant } from "../diseño.js";

export type EstadoMaestroTenant = 'INICIAL' | 'CREANDO' | 'MIGRANDO_TODAS';

export type ContextoMaestroTenant = {
    estado: EstadoMaestroTenant;
    tenants: ListaActivaEntidades<Tenant>;
};
