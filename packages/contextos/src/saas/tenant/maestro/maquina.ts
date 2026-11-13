import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroTenant, EstadoMaestroTenant } from "./diseño.js";
import * as maestro from "./maestro.js";

export const getMaquina: () => Maquina<EstadoMaestroTenant, ContextoMaestroTenant> = () => {
    return {
        INICIAL: {
            tenant_seleccionado: [maestro.Tenants.activar],
            tenant_deseleccionado: [maestro.Tenants.desactivar],

            tenant_cambiado: [maestro.Tenants.cambiar],
            tenant_borrado: [maestro.Tenants.quitar],

            recarga_de_tenants_solicitada: maestro.recargarTenants,
            criteria_cambiado: [maestro.Tenants.filtrar, maestro.recargarTenants],
            siguiente_pagina: [maestro.Tenants.filtrar, maestro.ampliarTenants],

            crear_tenant_solicitado: "CREANDO",
            migrar_todas_solicitado: "MIGRANDO_TODAS",
        },

        CREANDO: {
            alta_de_tenant_cancelada: "INICIAL",
            tenant_creado: maestro.incluirTenantCreadoPorId,
        },

        MIGRANDO_TODAS: {
            migracion_cancelada: "INICIAL",
            migracion_confirmada: maestro.migrarTodas,
        },
    };
};
