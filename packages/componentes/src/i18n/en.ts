import type { Traduccion } from "@olula/lib/i18n/i18n.ts";
import type { es } from "./es.ts";

export const en: Traduccion<typeof es> = {
    comun: {
        guardar: "Save",
        guardando: "Saving…",
        cancelar: "Cancel",
        aceptar: "OK",
        procesando: "Processing...",
        cargando: "Loading...",
        sinDatos: "No data",
        cerrar: "Close",
        volver: "Back",
        error: "Error",
    },
    listado: {
        exportar: "Export",
        exportando: "Exporting…",
        vistaCompacta: "Compact view",
        modoVista: "View mode",
        modos: { tarjetas: "Cards", tabla: "Table", kanban: "Kanban" },
        rango: "{{desde}}–{{hasta}} of {{total}}",
    },
    filtros: {
        filtros: "Filters",
        activos: "Active filters",
        aplicar: "Apply",
        aplicarRecuento: "Apply ({{recuento}})",
        quitar: "Remove filter {{etiqueta}}",
        limpiar: "Clear",
        limpiarTodo: "Clear all",
        cerrar: "Close filters",
        atajos: {
            hoy: "Today",
            ayer: "Yesterday",
            manana: "Tomorrow",
            estaSemana: "This week",
            semanaAnterior: "Last week",
            semanaSiguiente: "Next week",
            esteMes: "This month",
            mesAnterior: "Last month",
            mesSiguiente: "Next month",
            esteAno: "This year",
            anoAnterior: "Last year",
            anoSiguiente: "Next year",
        },
        meses: {
            m1: "January", m2: "February", m3: "March", m4: "April", m5: "May", m6: "June",
            m7: "July", m8: "August", m9: "September", m10: "October", m11: "November", m12: "December",
        },
    },
    acciones: {
        mas: "More actions",
    },
    modal: {
        cerrar: "Close dialog",
    },
    detalle: {
        cerrar: "Close detail",
    },
    campos: {
        abrir: "Open {{que}}",
        ficha: "record",
        limpiarSeleccion: "Clear selection",
        limpiarHora: "Clear time",
    },
    cabecera: {
        abrirMenuUsuario: "Open user menu",
        buscarPantalla: "Search screen (Ctrl K)",
        abrirMenuLateral: "Open side menu",
        expandirMenuLateral: "Expand or collapse the side menu",
    },
    menu: {
        "Ventas": "Sales",
        "Clientes": "Customers",
        "Mi cuenta": "My account",
        "Cerrar sesión": "Log out",
    },
};
