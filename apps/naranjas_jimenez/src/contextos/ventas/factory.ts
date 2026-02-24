import { menuVentas } from "./menu.ts";
import { CrearLineaNrj } from "./pedido/crear_linea/CrearLinea.tsx";
import { LineasListaNrj } from "./pedido/detalle/Lineas/LineasLista.tsx";
import { ventasPedidoInfra } from "./pedido/infraestructura.ts";

export class FactoryVentasNrj {

    static menu = menuVentas

    static pedido_detalle_lineas_LineasLista = LineasListaNrj
    static pedido_CrearLinea = CrearLineaNrj
    static pedido_infraestructura = ventasPedidoInfra
}
