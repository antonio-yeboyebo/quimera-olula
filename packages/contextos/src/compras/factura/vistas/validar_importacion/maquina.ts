import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoValidarImportacion, EstadoValidarImportacion } from "./diseño.ts";
import {
    aplicarArticuloCreado,
    editarLeida,
    guardarLeida,
    iniciarCreacionArticulo,
    limpiarLineaArticulo,
    proponer,
    reproponerSiSucia,
} from "./validar_importacion.ts";

export const getMaquina: () => Maquina<EstadoValidarImportacion, ContextoValidarImportacion> = () => ({
    CARGANDO_PROPUESTA: {
        propuesta_solicitada: [proponer, "EDITANDO"],
    },

    EDITANDO: {
        leida_ajustada: [guardarLeida],
        leida_editada: [editarLeida],
        repropuesta_solicitada: [reproponerSiSucia],
        leida_cambiada: [guardarLeida, proponer],
        crear_articulo_solicitado: [iniciarCreacionArticulo, "CREANDO_ARTICULO"],
        confirmar_solicitado: "CONFIRMANDO",
    },

    CREANDO_ARTICULO: {
        articulo_creado: [aplicarArticuloCreado, proponer, "EDITANDO"],
        creacion_cancelada: [limpiarLineaArticulo, "EDITANDO"],
    },

    CONFIRMANDO: {
        confirmacion_cancelada: "EDITANDO",
    },
});
