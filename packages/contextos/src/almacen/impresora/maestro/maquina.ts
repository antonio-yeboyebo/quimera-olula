import { Maquina } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Impresora } from "../diseño.ts";
import {
    ampliarImpresoras,
    Impresoras,
    incluirImpresoraCreadaPorId,
    recargarImpresoras,
} from "./maestro.ts";

export type EstadoMaestroImpresora = "INICIAL" | "CREANDO";

export type ContextoMaestroImpresora = {
    estado: EstadoMaestroImpresora;
    impresoras: ListaActivaEntidades<Impresora>;
};

export const getMaquina: () => Maquina<EstadoMaestroImpresora, ContextoMaestroImpresora> = () => ({
    INICIAL: {
        impresora_seleccionada: [Impresoras.activar],
        impresora_deseleccionada: [Impresoras.desactivar],
        impresora_cambiada: [Impresoras.cambiar],
        impresora_borrada: [Impresoras.quitar],
        recarga_de_impresoras_solicitada: recargarImpresoras,
        criteria_cambiado: [Impresoras.filtrar, recargarImpresoras],
        siguiente_pagina: [Impresoras.filtrar, ampliarImpresoras],
        crear_impresora_solicitado: "CREANDO",
    },
    CREANDO: {
        alta_de_impresora_cancelada: "INICIAL",
        impresora_creada: incluirImpresoraCreadaPorId,
    },
});
