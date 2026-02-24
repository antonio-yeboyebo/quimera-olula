import { LineaPedido } from "#/ventas/pedido/diseño.ts";
import { Entidad } from "@olula/lib/diseño.js";

export interface PaletLineaPedidoNrj extends Entidad {
    id: string;
    cantidadEnvases: number;
}

export interface LineaPedidoNrj extends LineaPedido {
    idVariedad: string;
    cantidadEnvasesAsignados: number;
    palets: PaletLineaPedidoNrj[];
}

// type NuevaLineaPedidoNrj = {
//     cantidadEnvases: number;
//     idVariedad: string;
// };

// export type PostLineaNrj = (id: string, linea: NuevaLineaPedidoNrj) => Promise<string>;
