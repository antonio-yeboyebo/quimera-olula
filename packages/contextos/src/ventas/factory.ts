import { menuVentas } from "./menu.ts";
import { CrearLineaBase } from "./pedido/crear_linea/CrearLinea.tsx";
import { LineasListaBase } from "./pedido/detalle/Lineas/LineasLista.tsx";
import { TabDatosBase as PedidoTabDatosBase } from "./pedido/detalle/TabDatos.tsx";
import { metaPedido } from "./pedido/detalle/dominio.ts";
import { ventasPedidoInfra } from "./pedido/infraestructura.ts";
import { payloadPatchPedido, pedidoDesdeAPI } from "./pedido/infraestructura_base.ts";
import { metaTablaPedido } from "./pedido/maestro/metatabla_pedido.ts";

export class FactoryVentasOlula {

    static pedido_detalle_lineas_LineasLista = LineasListaBase
    // static pedido_infraestructura_linea_desde_api = lineaPedidoDesdeApi
    static pedido_infraestructura = ventasPedidoInfra
    static pedido_CrearLinea = CrearLineaBase


    static PedidoTabDatos = PedidoTabDatosBase
    static pedidoDesdeAPI = pedidoDesdeAPI
    static metaTablaPedido = metaTablaPedido
    static api_payloadPatchPedido = payloadPatchPedido
    static metaPedido = metaPedido
    static menu = menuVentas
}
