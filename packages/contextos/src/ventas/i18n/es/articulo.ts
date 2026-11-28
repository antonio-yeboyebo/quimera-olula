/** Artículos de venta (`ventas/articulo`) y precios por artículo del cliente (`ventas/precio_articulo`). */
export const articulo = {
    maestro: {
        titulo: "Artículos",
        nuevo: "Nuevo Artículo",
        referencia: "Referencia",
        descripcion: "Descripción",
        familia: "Familia",
        codBarras: "Cód. barras",
        precio: "Precio",
        soloVendibles: "Solo vendibles",
        sinStock: "Sin stock",
        pvpVariable: "PVP variable",
    },
    detalle: {
        verEnAlmacen: "Ver en almacén",
        general: "General",
        ventas: "Ventas",
        descripcion: "Descripción",
        codigoBarras: "Código de barras",
        observaciones: "Observaciones",
        precio: "Precio",
        pvpVariable: "PVP variable",
        sinStock: "Sin stock",
    },
    errores: {
        crear: "Error al crear el artículo",
        guardar: "Error al guardar el artículo",
    },
} as const;

export const precioArticulo = {
    nuevo: "Nuevo precio por artículo",
    borrar: {
        titulo: "Borrar precio por artículo",
        mensaje: "¿Seguro que quiere borrar el precio de {{articulo}} (cantidad: {{tramo}})?",
    },
    campos: {
        cantidadDesde: "Cantidad desde (0 = sin límite)",
        cantidadHasta: "Cantidad hasta (0 = sin límite)",
        descuento: "% Descuento",
        precioNeto: "Precio neto",
        ayudaDescuento: "Con descuento se aplica sobre el precio de la tarifa del cliente o de la ficha del artículo.",
    },
    lista: {
        referencia: "Referencia",
        descripcion: "Descripción",
        cantidad: "Cantidad",
        dto: "% Dto.",
        precioNeto: "Precio neto",
    },
    tramo: {
        todas: "Todas",
        desde: "Desde {{minimo}}",
        hasta: "Hasta {{maximo}}",
    },
    desdeMayorQueHasta: "La cantidad desde no puede ser mayor que la cantidad hasta",
    errores: {
        obtener: "Error al obtener los precios por artículo del cliente",
        crear: "Error al crear el precio por artículo",
        cambiar: "Error al cambiar el precio por artículo",
        borrar: "Error al borrar el precio por artículo",
    },
} as const;
