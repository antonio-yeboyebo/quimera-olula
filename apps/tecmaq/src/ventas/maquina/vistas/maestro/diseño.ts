import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ItemMaquina } from "../../diseño.ts";

export type EstadoMaestroMaquina = "INICIAL";

export type ContextoMaestroMaquina = {
    estado: EstadoMaestroMaquina;
    maquinas: ListaActivaEntidades<ItemMaquina>;
};
