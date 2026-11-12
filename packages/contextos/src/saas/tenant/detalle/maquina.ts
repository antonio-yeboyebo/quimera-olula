import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import * as detalle from "./detalle.js";
import { ContextoDetalleTenant, EstadoDetalleTenant } from "./diseño.js";

export const getMaquina: () => Maquina<EstadoDetalleTenant, ContextoDetalleTenant> = () => {
    return {
        INICIAL: {
            tenant_id_cambiado: [detalle.cargarContexto],
            tenant_deseleccionado: [publicar('tenant_deseleccionado', null)],
        },

        ABIERTO: {
            tenant_id_cambiado: [detalle.cargarContexto],
            tenant_deseleccionado: [publicar('tenant_deseleccionado', null)],
            tenant_guardado: [detalle.refrescarTenant],
            sondeo_solicitado: detalle.sondearTenant,

            suspender_solicitado: detalle.suspender,
            reactivar_solicitado: detalle.reactivar,
            migrar_solicitado: detalle.migrar,
            exportar_solicitado: detalle.exportar,
            baja_solicitada: "DANDO_DE_BAJA",
            eliminar_bd_solicitado: "ELIMINANDO_BD",

            modulo_activacion_solicitada: detalle.activarModulo,
            modulo_desactivacion_solicitada: detalle.desactivarModulo,

            acceso_usuario_cambiado: detalle.bloquearUsuario,
            grupo_usuario_cambiado: detalle.cambiarGrupoUsuario,
            contrasena_usuario_solicitada: detalle.solicitarContrasena,
        },

        DANDO_DE_BAJA: {
            baja_confirmada: [detalle.refrescarTenant, detalle.refrescarUsuarios, "ABIERTO"],
            baja_cancelada: "ABIERTO",
        },

        ELIMINANDO_BD: {
            bd_eliminada: [detalle.refrescarTenant, "ABIERTO"],
            eliminacion_bd_cancelada: "ABIERTO",
        },

        CAMBIANDO_CONTRASENA: {
            contrasena_cambiada: detalle.contrasenaCambiada,
            cambio_contrasena_cancelado: "ABIERTO",
        },
    };
};
