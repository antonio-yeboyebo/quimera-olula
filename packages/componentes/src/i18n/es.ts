/** Textos de `@olula/componentes` (namespace `componentes`). Referencia: español. */
export const es = {
    comun: {
        guardar: "Guardar",
        guardando: "Guardando…",
        cancelar: "Cancelar",
        aceptar: "Aceptar",
        procesando: "Procesando...",
        cargando: "Cargando...",
        sinDatos: "No hay datos",
        cerrar: "Cerrar",
        volver: "Volver",
        error: "Error",
    },
    listado: {
        exportar: "Exportar",
        exportando: "Exportando…",
        vistaCompacta: "Vista compacta",
        modoVista: "Modo de vista",
        modos: { tarjetas: "Tarjetas", tabla: "Tabla", kanban: "Kanban" },
        rango: "{{desde}}–{{hasta}} de {{total}}",
    },
    filtros: {
        filtros: "Filtros",
        activos: "Filtros activos",
        aplicar: "Aplicar",
        aplicarRecuento: "Aplicar ({{recuento}})",
        quitar: "Quitar filtro {{etiqueta}}",
        limpiar: "Limpiar",
        limpiarTodo: "Limpiar todo",
        cerrar: "Cerrar filtros",
        atajos: {
            hoy: "Hoy",
            ayer: "Ayer",
            manana: "Mañana",
            estaSemana: "Esta semana",
            semanaAnterior: "Semana anterior",
            semanaSiguiente: "Semana siguiente",
            esteMes: "Este mes",
            mesAnterior: "Mes anterior",
            mesSiguiente: "Mes siguiente",
            esteAno: "Este año",
            anoAnterior: "Año anterior",
            anoSiguiente: "Año siguiente",
        },
        meses: {
            m1: "enero", m2: "febrero", m3: "marzo", m4: "abril", m5: "mayo", m6: "junio",
            m7: "julio", m8: "agosto", m9: "septiembre", m10: "octubre", m11: "noviembre", m12: "diciembre",
        },
    },
    acciones: {
        mas: "Más acciones",
    },
    modal: {
        cerrar: "Cerrar modal",
    },
    detalle: {
        cerrar: "Cerrar detalle",
    },
    campos: {
        abrir: "Abrir {{que}}",
        ficha: "ficha",
        limpiarSeleccion: "Limpiar selección",
        limpiarHora: "Limpiar hora",
    },
    cabecera: {
        abrirMenuUsuario: "Abrir menú usuario",
        buscarPantalla: "Buscar pantalla (Ctrl K)",
        abrirMenuLateral: "Abrir menú lateral",
        expandirMenuLateral: "Expandir o contraer el menú lateral",
    },
    /** Entradas de menú (lateral y del usuario), por su nombre en español. Lo que no está aquí no se traduce. */
    menu: {
        "Ventas": "Ventas",
        "Clientes": "Clientes",
        "Mi cuenta": "Mi cuenta",
        "Cerrar sesión": "Cerrar sesión",
    },
} as const;
