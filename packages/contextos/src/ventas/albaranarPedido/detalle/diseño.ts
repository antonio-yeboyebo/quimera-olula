import { ListaSeleccionable } from "@olula/lib/diseño.js";
import { Pedido } from "../../pedido/diseño.ts";
import { LineaAlbaranarPedido } from "../diseño.ts";

export type EstadoAlbaranarPedido =
    | "INICIAL"
    | "VACIO"
    | "CARGANDO"
    | "LISTO"
    | "CONFIRMANDO_ALBARANADO"
    | "ALBARANADO_COMPLETADO"
    | "ALBARANANDO";

export type ContextoAlbaranarPedido = {
    estado: EstadoAlbaranarPedido;
    pedido: Pedido;
    lineas: ListaSeleccionable<LineaAlbaranarPedido>;
};
