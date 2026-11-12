import { MetaTabla } from "@olula/componentes/index.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { MotivoTarea } from "../diseño.ts";

export type EstadoMaestroMotivoTarea = "INICIAL" | "CREANDO_MOTIVO_TAREA";

export type ContextoMaestroMotivoTarea = {
    estado: EstadoMaestroMotivoTarea;
    motivosTarea: ListaActivaEntidades<MotivoTarea>;
};

export const metaTablaMotivoTarea: MetaTabla<MotivoTarea> = [
    { id: "descripcion", cabecera: "Descripción" },
    { id: "activo", cabecera: "Activo", tipo: "booleano" },
];
