import { CampoInforme, FichaInforme, PestañaInforme } from "#/comun/informe_documentos/diseño.ts";
import { OPCIONES_INTERVALO } from "#/comun/informe_documentos/dominio.ts";
import { ControlAgente, ControlCliente } from "./controles.tsx";
import { tVentas } from "../i18n/index.ts";

/**
 * Pestañas de Ventas > Informes: los criterios de `i_presupuestoscli`,
 * `i_pedidoscli`, `i_albaranescli` e `i_facturascli` de Eneboo, en filas como
 * en sus formularios. Los nombres son los de la API.
 *
 * Las pestañas se piden al pintar (`pestañasVentas(t)`): las etiquetas salen en el idioma
 * activo. El valor de las opciones es el de la API (en español); solo se traduce lo que se ve.
 */

type T = typeof tVentas;
type ClaveOpcion = Parameters<T>[0] & `informe.opciones.${string}`;

const opciones = (t: T, valores: [string, ClaveOpcion][]) =>
    valores.map(([valor, clave]) => ({ valor, descripcion: t(clave) }));

const ordenes = (t: T) => opciones(t, [
    ["No ordenar", "informe.opciones.noOrdenar"],
    ["Código", "informe.opciones.codigo"],
    ["Cod.Cliente", "informe.opciones.codCliente"],
    ["Cliente", "informe.opciones.cliente"],
    ["Fecha", "informe.opciones.fecha"],
    ["Total", "informe.opciones.total"],
]);
const sentidos = (t: T) => opciones(t, [
    ["Ascendente", "informe.opciones.ascendente"],
    ["Descendente", "informe.opciones.descendente"],
]);
const todosSiNo = (t: T) => opciones(t, [
    ["Todos", "informe.opciones.todos"],
    ["Sí", "informe.opciones.si"],
    ["No", "informe.opciones.no"],
]);

const texto = (id: string, label: string): CampoInforme => ({ id, label, tipo: "texto" });

const casilla = (id: string, label: string, activo?: CampoInforme["activo"]): CampoInforme => ({
    id,
    label,
    tipo: "casilla",
    activo,
});

const combo = (id: string, label: string, valores: CampoInforme["opciones"]): CampoInforme => ({
    id,
    label,
    tipo: "opciones",
    opciones: valores,
});

const filasComunes = (t: T, documento: string): CampoInforme[][] => [
    [
        texto("codigo_desde", t("informe.campos.codigoDesde", { documento })),
        texto("codigo_hasta", t("informe.campos.codigoHasta", { documento })),
    ],
    [
        texto("ejercicio_id", t("informe.campos.ejercicio")),
        combo("intervalo", t("informe.campos.intervalo"), OPCIONES_INTERVALO),
        { id: "fecha_desde", label: t("informe.campos.fechaDesde"), tipo: "fecha" },
        { id: "fecha_hasta", label: t("informe.campos.fechaHasta"), tipo: "fecha" },
    ],
    [
        { id: "cliente_id", label: t("informe.campos.cliente"), tipo: "propio", Control: ControlCliente },
        { id: "agente_id", label: t("informe.campos.agente"), tipo: "propio", Control: ControlAgente },
    ],
];

const filasOrden = (t: T, documentos: string): CampoInforme[][] => [
    [
        combo("orden1", t("informe.campos.ordenarPor", { documentos, n: 1 }), ordenes(t)),
        combo("tipo_orden1", t("informe.campos.orden"), sentidos(t)),
    ],
    [
        combo("orden2", t("informe.campos.ordenarPor", { documentos, n: 2 }), ordenes(t)),
        combo("tipo_orden2", t("informe.campos.orden"), sentidos(t)),
    ],
];

const INICIAL_COMUN = {
    intervalo: "",
    orden1: "No ordenar",
    tipo_orden1: "Ascendente",
    orden2: "No ordenar",
    tipo_orden2: "Ascendente",
};

export const presupuestos = (t: T = tVentas): PestañaInforme => ({
    clave: "presupuestos",
    titulo: t("informe.pestanas.presupuestos"),
    url: "/ventas/informe/presupuestos",
    regla: "ventas.presupuesto.leer",
    filas: [
        ...filasComunes(t, t("informe.documento.presupuesto")),
        [combo("pte_aprobar", t("informe.campos.pteAprobar"), todosSiNo(t))],
        ...filasOrden(t, t("informe.pestanas.presupuestos")),
    ],
    inicial: { ...INICIAL_COMUN, pte_aprobar: "Todos" },
});

export const pedidos = (t: T = tVentas): PestañaInforme => ({
    clave: "pedidos",
    titulo: t("informe.pestanas.pedidos"),
    url: "/ventas/informe/pedidos",
    regla: "ventas.pedido.leer",
    filas: [
        ...filasComunes(t, t("informe.documento.pedido")),
        [
            combo("servido", t("informe.campos.servido"), opciones(t, [
                ["Todos", "informe.opciones.todos"],
                ["Pendiente", "informe.opciones.pendiente"],
                ["Sí", "informe.opciones.si"],
                ["No", "informe.opciones.no"],
                ["Parcial", "informe.opciones.parcial"],
            ])),
            texto("serie_id", t("informe.campos.serie")),
            texto("referencia", t("informe.campos.referencia")),
        ],
        [
            casilla("mostrar_lineas", t("informe.campos.mostrarLineas")),
            casilla("solo_pendientes", t("informe.campos.soloPendientes")),
        ],
        ...filasOrden(t, t("informe.pestanas.pedidos")),
    ],
    inicial: { ...INICIAL_COMUN, servido: "Todos", mostrar_lineas: false, solo_pendientes: false },
});

export const albaranes = (t: T = tVentas): PestañaInforme => ({
    clave: "albaranes",
    titulo: t("informe.pestanas.albaranes"),
    url: "/ventas/informe/albaranes",
    regla: "ventas.albaran.leer",
    filas: [
        ...filasComunes(t, t("informe.documento.albaran")),
        [combo("pte_factura", t("informe.campos.pteFactura"), todosSiNo(t))],
        ...filasOrden(t, t("informe.pestanas.albaranes")),
    ],
    inicial: { ...INICIAL_COMUN, pte_factura: "Todos" },
});

const filtraImportes = (ficha: FichaInforme) => ficha.filtrar_importes === true;
const esAcumulado = (ficha: FichaInforme) => ficha.acumulado === true;

/** `habilitarPorFiltroImportes` de `i_facturascli.qs`: sin «Filtrar por
 * importe» los importes se vacían. */
const ajustarFacturas = (ficha: FichaInforme, campo: string): FichaInforme =>
    campo === "filtrar_importes" && !ficha.filtrar_importes
        ? { ...ficha, importe_desde: "", importe_hasta: "" }
        : ficha;

export const facturas = (t: T = tVentas): PestañaInforme => ({
    clave: "facturas",
    titulo: t("informe.pestanas.facturas"),
    url: "/ventas/informe/facturas",
    regla: "ventas.factura.leer",
    filas: [
        ...filasComunes(t, t("informe.documento.factura")),
        [
            texto("grupo_cliente_id", t("informe.campos.grupoClientes")),
            combo("regimen_iva", t("informe.campos.regimenIva"), opciones(t, [
                ["Todos", "informe.opciones.todos"],
                ["General", "informe.opciones.general"],
                ["Exportaciones", "informe.opciones.exportaciones"],
                ["U.E.", "informe.opciones.ue"],
                ["Exento", "informe.opciones.exento"],
            ])),
        ],
        [combo("pte_pago", t("informe.campos.ptePago"), todosSiNo(t)), texto("serie_id", t("informe.campos.serie"))],
        [
            casilla("de_abono", t("informe.campos.soloAbono")),
            casilla("incluir_borradores", t("informe.campos.incluirBorradores")),
        ],
        [
            casilla("filtrar_importes", t("informe.campos.filtrarImporte")),
            { id: "importe_desde", label: t("informe.campos.importeDesde"), tipo: "decimal", activo: filtraImportes },
            { id: "importe_hasta", label: t("informe.campos.importeHasta"), tipo: "decimal", activo: filtraImportes },
        ],
        [combo("tipo_informe", t("informe.campos.tipoInforme"), opciones(t, [
            ["Moneda original", "informe.opciones.monedaOriginal"],
            ["Moneda original y euros", "informe.opciones.monedaOriginalEuros"],
            ["Euros", "informe.opciones.euros"],
        ]))],
        [
            casilla("acumulado", t("informe.campos.acumulado")),
            {
                ...combo("orden_acumulado", t("informe.campos.ordenAcumulado"),
                    [{ valor: "DESC", descripcion: "DESC" }, { valor: "ASC", descripcion: "ASC" }]),
                activo: esAcumulado,
            },
            { id: "limite_acumulado", label: t("informe.campos.limiteAcumulado"), tipo: "entero", activo: esAcumulado },
        ],
        ...filasOrden(t, t("informe.pestanas.facturas")),
    ],
    inicial: {
        ...INICIAL_COMUN,
        regimen_iva: "Todos",
        pte_pago: "Todos",
        de_abono: false,
        incluir_borradores: false,
        filtrar_importes: false,
        tipo_informe: "Moneda original",
        acumulado: false,
        orden_acumulado: "DESC",
    },
    ajustar: ajustarFacturas,
});

export const pestañasVentas = (t: T = tVentas): PestañaInforme[] =>
    [presupuestos(t), pedidos(t), albaranes(t), facturas(t)];
