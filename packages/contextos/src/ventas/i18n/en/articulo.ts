import type { Traduccion } from "@olula/lib/i18n/i18n.ts";
import type { articulo as esArticulo, precioArticulo as esPrecioArticulo } from "../es/articulo.ts";

export const articulo: Traduccion<typeof esArticulo> = {
    maestro: {
        titulo: "Items",
        nuevo: "New Item",
        referencia: "Reference",
        descripcion: "Description",
        familia: "Family",
        codBarras: "Barcode",
        precio: "Price",
        soloVendibles: "Saleable only",
        sinStock: "No stock",
        pvpVariable: "Variable price",
    },
    detalle: {
        verEnAlmacen: "View in warehouse",
        general: "General",
        ventas: "Sales",
        descripcion: "Description",
        codigoBarras: "Barcode",
        observaciones: "Notes",
        precio: "Price",
        pvpVariable: "Variable price",
        sinStock: "No stock",
    },
    errores: {
        crear: "Error creating the item",
        guardar: "Error saving the item",
    },
};

export const precioArticulo: Traduccion<typeof esPrecioArticulo> = {
    nuevo: "New item price",
    borrar: {
        titulo: "Delete item price",
        mensaje: "Are you sure you want to delete the price of {{articulo}} (quantity: {{tramo}})?",
    },
    campos: {
        cantidadDesde: "Quantity from (0 = no limit)",
        cantidadHasta: "Quantity to (0 = no limit)",
        descuento: "% Discount",
        precioNeto: "Net price",
        ayudaDescuento: "A discount applies to the price of the customer's rate or of the item.",
    },
    lista: {
        referencia: "Reference",
        descripcion: "Description",
        cantidad: "Quantity",
        dto: "% Disc.",
        precioNeto: "Net price",
    },
    tramo: {
        todas: "All",
        desde: "From {{minimo}}",
        hasta: "Up to {{maximo}}",
    },
    desdeMayorQueHasta: "The quantity from cannot be greater than the quantity to",
    errores: {
        obtener: "Error getting the customer's item prices",
        crear: "Error creating the item price",
        cambiar: "Error changing the item price",
        borrar: "Error deleting the item price",
    },
};
