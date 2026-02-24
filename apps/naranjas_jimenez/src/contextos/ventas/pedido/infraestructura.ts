import { LineaPedidoAPI, postLinea } from "#/ventas/pedido/infraestructura.ts";
import { LineaPedidoNrj } from "./diseño.ts";

interface PaletLineaPedidoApiNrj {
    id: string
    cantidad_envases: number
}
export interface LineaPedidoApiNrj extends LineaPedidoAPI {
    variedad_id: string
    cantidad_envases_asignados: number
    palets: PaletLineaPedidoApiNrj[]
}

const lineaPedidoDesdeApi = (l: LineaPedidoApiNrj): LineaPedidoNrj => {
    return {
        ...l,
        idVariedad: l.variedad_id,
        cantidadEnvasesAsignados: l.cantidad_envases_asignados,
        palets: l.palets.map(p => ({
            id: p.id,
            cantidadEnvases: p.cantidad_envases
        }))
    }
};

export const ventasPedidoInfra = {
    linea_desde_api: lineaPedidoDesdeApi,
    postLinea: postLinea
}