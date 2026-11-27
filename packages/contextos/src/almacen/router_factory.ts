import { MaestroAlmacen } from "./almacen/vistas/maestro/MaestroAlmacen.tsx"
import { MaestroConDetalleArticulo } from "./articulo/maestro/MaestroConDetalleArticulo.tsx"
import { MaestroConDetalleCaja } from "./caja/maestro/MaestroConDetalleCaja.tsx"
import { MaestroConDetalleClaseAlmacenamiento } from "./clase_almacenamiento/maestro/MaestroConDetalleClaseAlmacenamiento.tsx"
import { ConfiguracionAlmacen } from "./configuracion/ConfiguracionAlmacen.tsx"
import { MaestroFamilia } from "./familia/vistas/maestro/MaestroFamilia.tsx"
import { MaestroConDetalleImpresora } from "./impresora/maestro/MaestroConDetalleImpresora.tsx"
import { InformeInventario, InformeInventarioValorado } from "./informe_inventario/InformeInventario.tsx"
import { MaestroConDetalleInventario } from "./inventario/maestro/MaestroConDetalleInventario.tsx"
import { MaestroLote } from "./lote/maestro/MaestroLote.tsx"
import { MapaAlmacen } from "./mapa/MapaAlmacen.tsx"
import { MaestroOrden } from "./orden/vistas/maestro/MaestroOrden.tsx"
import { MaestroConDetallePedidoCompra } from "./pedido_compra/maestro/MaestroConDetallePedidoCompra.tsx"
import { MaestroPedidoVenta } from "./pedido_venta/vistas/maestro/MaestroPedidoVenta.tsx"
import { MaestroConDetallePesoMedida } from "./peso_medida/maestro/MaestroConDetallePesoMedida.tsx"
import { MaestroConDetallePickingFijo } from "./picking_fijo/maestro/MaestroConDetallePickingFijo.tsx"
import { ReposicionPicking } from "./reposicion/ReposicionPicking.tsx"
import { Slotting } from "./slotting/Slotting.tsx"
import { MaestroConDetalleStock } from "./stock/maestro/MaestroConDetalleStock.tsx"
import { MaestroConDetalleTipoCaja } from "./tipo_caja/vistas/maestro/MaestroConDetalleTipoCaja.tsx"
import { MaestroConDetalleTipoUbicacion } from "./tipo_ubicacion/maestro/MaestroConDetalleTipoUbicacion.tsx"
import { MaestroDetalleTransferenciasStock } from "./transferencias/vistas/MaestroDetalleTransferenciasStock.tsx"
import { MaestroConDetalleUbicacion } from "./ubicacion/vistas/maestro/MaestroConDetalleUbicacion.tsx"
import { MaestroConDetalleZona } from "./zona/vistas/maestro/MaestroConDetalleZona.tsx"

export class RouterFactoryAlmacenOlula {
        static router = {
                "almacen/transferencias": MaestroDetalleTransferenciasStock,
                "almacen/articulo": MaestroConDetalleArticulo,
                "almacen/cajas": MaestroConDetalleCaja,
                "almacen/almacenes": MaestroAlmacen,
                "almacen/familias": MaestroFamilia,
                "almacen/pesos_medidas": MaestroConDetallePesoMedida,
                "almacen/lotes": MaestroLote,
                "almacen/inventarios": MaestroConDetalleInventario,
                "almacen/informe_inventario": InformeInventario,
                "almacen/informe_inventario_valorado": InformeInventarioValorado,
                "almacen/ordenes": MaestroOrden,
                "almacen/pedidos_compra": MaestroConDetallePedidoCompra,
                "almacen/pedidos_venta": MaestroPedidoVenta,
                "almacen/stock": MaestroConDetalleStock,
                "almacen/ubicaciones": MaestroConDetalleUbicacion,
                "almacen/tipos_caja": MaestroConDetalleTipoCaja,
                "almacen/tipos_ubicacion": MaestroConDetalleTipoUbicacion,
                "almacen/clases_almacenamiento": MaestroConDetalleClaseAlmacenamiento,
                "almacen/zonas": MaestroConDetalleZona,
                "almacen/picking_fijo": MaestroConDetallePickingFijo,
                "almacen/reposicion": ReposicionPicking,
                "almacen/slotting": Slotting,
                "almacen/mapa": MapaAlmacen,
                "almacen/impresoras": MaestroConDetalleImpresora,
                "almacen/configuracion": ConfiguracionAlmacen,
        }
}
