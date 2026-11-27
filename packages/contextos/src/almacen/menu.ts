// Cajas, órdenes, ubicaciones, tipos de caja, zonas y pedidos de compra/venta del
// almacén son del SGA: sólo con su plugin activo.
//
// Orden (doc sga_ergonomia.md, punto 2), sin subniveles: comunes; operación (órdenes, pedidos,
// reposición); consulta (stock, cajas, mapa); organización (zonas, ubicaciones, picking fijo,
// slotting); y la configuración (tipos y clases) en una sola entrada con pestañas.
export const menuAlmacen = {
    "Almacén": { icono: "menu_almacen", area: "Operaciones" },
    "Almacén/Resumen": { url: "/dashboard/almacen" },
    "Almacén/Artículos": { url: "/almacen/articulo", regla: "almacen.articulo" },
    "Almacén/Almacenes": { url: "/almacen/almacenes", regla: "almacen.almacen" },
    "Almacén/Familias": { url: "/almacen/familias", regla: "almacen.familia" },
    // Extensión pesos_medidas de Eneboo: solo con su plugin activo.
    "Almacén/Unidades de pesos y medidas": {
        alias: ["unidades", "medidas", "pesos"],
        url: "/almacen/pesos_medidas",
        regla: "almacen.peso_medida",
        plugin: "pesos_medidas",
    },
    "Almacén/Inventario": { alias: ["inventarios", "recuento", "regularización"], url: "/almacen/inventarios", regla: "almacen.inventario" },
    "Almacén/Informe inventario": {
        alias: ["informe de inventario", "existencias por almacén"],
        url: "/almacen/informe_inventario",
        regla: "almacen.informe_inventario",
    },
    "Almacén/Informe inventario valorado": {
        alias: ["inventario valorado", "valoración de stock"],
        url: "/almacen/informe_inventario_valorado",
        regla: "almacen.informe_inventario_valorado",
    },
    "Almacén/Lotes": {
        alias: ["lotes", "caducidades", "revisar lotes", "trazabilidad"],
        url: "/almacen/lotes",
        regla: "almacen.lote",
    },
    "Almacén/Transferencias de Stock": { url: "/almacen/transferencias", regla: "almacen.transferencia_stock.leer" },
    // Operación
    "Almacén/Órdenes": { url: "/almacen/ordenes", regla: "almacen.orden.leer", plugin: "sga" },
    "Almacén/Pedidos de Compra": { url: "/almacen/pedidos_compra", regla: "almacen.pedido_compra.leer", plugin: "sga" },
    "Almacén/Pedidos de Venta": { url: "/almacen/pedidos_venta", regla: "almacen.pedido_venta.leer", plugin: "sga" },
    "Almacén/Reposición de picking": { url: "/almacen/reposicion", regla: "almacen.picking_fijo", plugin: "sga" },
    // Consulta
    "Almacén/Stock": { alias: ["existencias", "inventario"], url: "/almacen/stock", regla: "almacen.stock" },
    "Almacén/Cajas": { url: "/almacen/cajas", regla: "almacen.caja", plugin: "sga" },
    "Almacén/Mapa del almacén": { alias: ["plano", "layout"], url: "/almacen/mapa", regla: "almacen.ubicacion", plugin: "sga" },
    // Organización
    "Almacén/Zonas": { url: "/almacen/zonas", regla: "almacen.zona", plugin: "sga" },
    "Almacén/Ubicaciones": { url: "/almacen/ubicaciones", regla: "almacen.ubicacion", plugin: "sga" },
    "Almacén/Picking fijo": { url: "/almacen/picking_fijo", regla: "almacen.picking_fijo", plugin: "sga" },
    "Almacén/Slotting": { url: "/almacen/slotting", regla: "almacen.picking_fijo", plugin: "sga" },
    // Configuración: tipos de ubicación, tipos de caja y clases de almacenamiento.
    "Almacén/Configuración": {
        alias: ["tipos de ubicación", "tipos de caja", "clases de almacenamiento"],
        url: "/almacen/configuracion",
        regla: "almacen.tipo_ubicacion",
        plugin: "sga",
    },
    // Impresoras de etiquetas de red: solo con el plugin impresion activo.
    "Almacén/Impresoras de etiquetas": {
        alias: ["impresoras", "etiquetadoras", "zpl"],
        url: "/almacen/impresoras",
        regla: "almacen.impresora",
        plugin: "impresion",
    },
};
