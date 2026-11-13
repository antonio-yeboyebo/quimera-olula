import { AccesoSoporte, Tenant, UsuarioSoporte } from "../diseño.js";

export type EstadoDetalleTenant =
    | 'INICIAL'
    | 'ABIERTO'
    | 'DANDO_DE_BAJA'
    | 'ELIMINANDO_BD'
    | 'CAMBIANDO_CONTRASENA';

export type ContextoDetalleTenant = {
    estado: EstadoDetalleTenant;
    tenant: Tenant;
    usuarios: UsuarioSoporte[];
    grupos: string[];
    accesos: AccesoSoporte[];
    usuarioContrasena: UsuarioSoporte | null;
};
