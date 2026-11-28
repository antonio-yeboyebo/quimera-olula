import { CampoInforme, FichaInforme, PestañaInforme } from "#/comun/informe_documentos/diseño.ts";
import { OPCIONES_INTERVALO } from "#/comun/informe_documentos/dominio.ts";
import { ControlProveedor } from "./controles.tsx";
import { tCompras } from "#/compras/i18n/index.ts";

/**
 * Pestañas de Compras > Informes: los criterios de `i_pedidosprov`,
 * `i_albaranesprov` e `i_facturasprov` de Eneboo, en filas como en sus
 * formularios. Los nombres son los de la API.
 *
 * Las pestañas se piden al pintar (`pestañasCompras(t)`): las etiquetas salen en el idioma
 * activo. El valor de las opciones es el de la API (en español); solo se traduce lo que se ve.
 */

type T = typeof tCompras;
type ClaveOpcion = Parameters<T>[0] & `informe.opciones.${string}`;

const opciones = (t: T, valores: [string, ClaveOpcion][]) =>
    valores.map(([valor, clave]) => ({ valor, descripcion: t(clave) }));

const ordenes = (t: T) => opciones(t, [
    ["No ordenar", "informe.opciones.noOrdenar"],
    ["Código", "informe.opciones.codigo"],
    ["Cod.Proveedor", "informe.opciones.codProveedor"],
    ["Proveedor", "informe.opciones.proveedor"],
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

const tiposInforme = (t: T) => opciones(t, [
    ["Moneda original", "informe.opciones.monedaOriginal"],
    ["Moneda original y euros", "informe.opciones.monedaOriginalEuros"],
    ["Euros", "informe.opciones.euros"],
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
    [combo("tipo_informe", t("informe.tipoInforme"), tiposInforme(t))],
    [
        texto("codigo_desde", t("informe.desdeNumero", { documento })),
        texto("codigo_hasta", t("informe.hastaNumero", { documento })),
    ],
    [
        texto("ejercicio_id", t("informe.ejercicio")),
        combo("intervalo", t("informe.intervalo"), OPCIONES_INTERVALO),
        { id: "fecha_desde", label: t("informe.fechaDesde"), tipo: "fecha" },
        { id: "fecha_hasta", label: t("informe.fechaHasta"), tipo: "fecha" },
    ],
    [{ id: "proveedor_id", label: t("comun.campos.proveedor"), tipo: "propio", Control: ControlProveedor }],
];

const filasOrden = (t: T, documentos: string): CampoInforme[][] => [
    [
        combo("orden1", t("informe.ordenarPor", { documentos, n: 1 }), ordenes(t)),
        combo("tipo_orden1", t("informe.orden"), sentidos(t)),
    ],
    [
        combo("orden2", t("informe.ordenarPor", { documentos, n: 2 }), ordenes(t)),
        combo("tipo_orden2", t("informe.orden"), sentidos(t)),
    ],
];

const INICIAL_COMUN = {
    tipo_informe: "Moneda original",
    intervalo: "",
    orden1: "No ordenar",
    tipo_orden1: "Ascendente",
    orden2: "No ordenar",
    tipo_orden2: "Ascendente",
};

/** «Calcular detalle», «Calcular resumen» y «Calcular resumen por líneas». */
const modosPedidos = (t: T): PestañaInforme["modos"] => [
    { modo: "detalle", etiqueta: t("informe.modos.detalle") },
    { modo: "resumen", etiqueta: t("informe.modos.resumen") },
    { modo: "resumen_lineas", etiqueta: t("informe.modos.resumenLineas") },
];

export const pedidos = (t: T = tCompras): PestañaInforme => ({
    clave: "pedidos",
    titulo: t("informe.pedidos"),
    url: "/compras/informe/pedidos",
    regla: "compras.pedido",
    filas: [
        ...filasComunes(t, t("informe.pedido")),
        [
            combo("intervalo_entrada", t("informe.intervaloEntrada"), OPCIONES_INTERVALO),
            { id: "fecha_entrada_desde", label: t("informe.entradaDesde"), tipo: "fecha" },
            { id: "fecha_entrada_hasta", label: t("informe.entradaHasta"), tipo: "fecha" },
        ],
        [combo("servido", t("informe.servidos"), opciones(t, [
            ["Todos", "informe.opciones.todos"],
            ["Pendiente", "informe.opciones.pendiente"],
            ["Sí", "informe.opciones.si"],
            ["No", "informe.opciones.no"],
            ["Parcial", "informe.opciones.parcial"],
        ]))],
        [
            casilla("mostrar_lineas", t("informe.mostrarLineas")),
            casilla("solo_pendientes", t("informe.soloPendientes")),
        ],
        ...filasOrden(t, t("informe.pedidos")),
    ],
    inicial: {
        ...INICIAL_COMUN,
        intervalo_entrada: "",
        servido: "Todos",
        mostrar_lineas: false,
        solo_pendientes: false,
    },
    modos: modosPedidos(t),
});

export const albaranes = (t: T = tCompras): PestañaInforme => ({
    clave: "albaranes",
    titulo: t("informe.albaranes"),
    url: "/compras/informe/albaranes",
    regla: "compras.albaran",
    filas: [
        ...filasComunes(t, t("informe.albaran")),
        [combo("pte_factura", t("informe.pteFactura"), todosSiNo(t))],
        ...filasOrden(t, t("informe.albaranes")),
    ],
    inicial: { ...INICIAL_COMUN, pte_factura: "Todos" },
});

const filtraImportes = (ficha: FichaInforme) => ficha.filtrar_importes === true;

const esAcumulado = (ficha: FichaInforme) => ficha.acumulado === true;

/** `habilitarPorFiltroImportes`: sin «Filtrar por importe» los importes se vacían. */
const ajustarFacturas = (ficha: FichaInforme, campo: string): FichaInforme =>
    campo === "filtrar_importes" && !ficha.filtrar_importes
        ? { ...ficha, importe_desde: "", importe_hasta: "" }
        : ficha;

export const facturas = (t: T = tCompras): PestañaInforme => ({
    clave: "facturas",
    titulo: t("informe.facturas"),
    url: "/compras/informe/facturas",
    regla: "compras.factura",
    filas: [
        ...filasComunes(t, t("informe.factura")),
        [
            combo("pte_pago", t("informe.ptesPago"), todosSiNo(t)),
            texto("serie_id", t("comun.campos.serie")),
            combo("regimen_iva", t("informe.regimenIva"), opciones(t, [
                ["Todos", "informe.opciones.todos"],
                ["General", "informe.opciones.general"],
                ["Importaciones", "informe.opciones.importaciones"],
                ["UE", "informe.opciones.ue"],
                ["Exento", "informe.opciones.exento"],
            ])),
        ],
        [casilla("de_abono", t("informe.soloAbono"))],
        [
            casilla("filtrar_importes", t("informe.filtrarImporte")),
            { id: "importe_desde", label: t("informe.desdeImporte"), tipo: "decimal", activo: filtraImportes },
            { id: "importe_hasta", label: t("informe.hastaImporte"), tipo: "decimal", activo: filtraImportes },
        ],
        [
            casilla("acumulado", t("informe.acumulado")),
            {
                ...combo("orden_acumulado", t("informe.ordenAcumulado"), [
                    { valor: "DESC", descripcion: "DESC" },
                    { valor: "ASC", descripcion: "ASC" },
                ]),
                activo: esAcumulado,
            },
            { id: "limite_acumulado", label: t("informe.limiteAcumulado"), tipo: "entero", activo: esAcumulado },
        ],
        ...filasOrden(t, t("informe.facturas")),
    ],
    inicial: {
        ...INICIAL_COMUN,
        pte_pago: "Todos",
        regimen_iva: "Todos",
        de_abono: false,
        filtrar_importes: false,
        acumulado: false,
        orden_acumulado: "DESC",
    },
    ajustar: ajustarFacturas,
});

/** Las pestañas de Compras > Informes en el idioma activo. */
export const pestañasCompras = (t: T = tCompras): PestañaInforme[] => [pedidos(t), albaranes(t), facturas(t)];
