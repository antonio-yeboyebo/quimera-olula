import { CampoInforme, FichaInforme, PestañaInforme } from "#/comun/informe_documentos/diseño.ts";
import { aBooleano } from "#/comun/informe_documentos/dominio.ts";
import { ControlAlmacen, ControlFamilia } from "./controles.tsx";
import { ResultadoInventario } from "./resultado/ResultadoInventario.tsx";
import { tAlmacen } from "../i18n/index.ts";

/**
 * Criterios de `i_inventario` de Eneboo, en filas como su formulario. Las dos
 * pantallas comparten las fichas (la misma tabla); el informe sin valorar no
 * enseña la valoración. Los nombres son los de la API.
 */

/** Las opciones guardan el valor de Eneboo (en español) y enseñan su traducción. */
const TEXTO_OPCION: Record<string, () => string> = {
    "No ordenar": () => tAlmacen("informe_inventario.noOrdenar"),
    "Código": () => tAlmacen("informe_inventario.codigo"),
    "Nombre": () => tAlmacen("informe_inventario.nombre"),
    "Ascendente": () => tAlmacen("informe_inventario.ascendente"),
    "Descendente": () => tAlmacen("informe_inventario.descendente"),
    "Coste medio": () => tAlmacen("informe_inventario.costeMedio"),
    "PVP": () => tAlmacen("informe_inventario.pvp"),
    "Coste Prov.": () => tAlmacen("informe_inventario.costeProv"),
};

const opciones = (valores: string[]) =>
    valores.map((valor) => ({ valor, get descripcion() { return TEXTO_OPCION[valor]?.() ?? valor; } }));

export const ORDENES_ALMACEN = opciones(["No ordenar", "Código", "Nombre"]);
// «Descripcion» sin tilde: es el valor que guarda Eneboo.
export const ORDENES_ARTICULO = [
    { valor: "No ordenar", get descripcion() { return tAlmacen("informe_inventario.noOrdenar"); } },
    { valor: "Referencia", get descripcion() { return tAlmacen("informe_inventario.referencia"); } },
    { valor: "Descripcion", get descripcion() { return tAlmacen("informe_inventario.descripcion"); } },
];
export const SENTIDOS = opciones(["Ascendente", "Descendente"]);
export const VALORACIONES = opciones(["Coste medio", "PVP", "Coste Prov."]);

/** La etiqueta se pide al pintar, en el idioma activo. */
const combo = (id: string, label: () => string, valores: CampoInforme["opciones"]): CampoInforme => ({
    id,
    get label() { return label(); },
    tipo: "opciones",
    opciones: valores,
});

/** Sin «Actual» se pide la fecha (`habilitarAFecha` de Eneboo). */
const sinActual = (ficha: FichaInforme) => !aBooleano(ficha.actual);

/** Al marcar «Actual» la fecha deja de usarse y se vacía. */
export const ajustarInventario = (ficha: FichaInforme, campo: string): FichaInforme =>
    campo === "actual" && aBooleano(ficha.actual) ? { ...ficha, a_fecha: "" } : ficha;

const filasComunes: CampoInforme[][] = [
    [
        { id: "almacen_id", get label() { return tAlmacen("informe_inventario.almacen"); }, tipo: "propio", Control: ControlAlmacen },
        { id: "familia_id", get label() { return tAlmacen("informe_inventario.familia"); }, tipo: "propio", Control: ControlFamilia },
        { id: "marca_id", get label() { return tAlmacen("informe_inventario.marca"); }, tipo: "texto" },
    ],
    [
        { id: "actual", get label() { return tAlmacen("informe_inventario.actual"); }, tipo: "casilla" },
        { id: "a_fecha", get label() { return tAlmacen("informe_inventario.aFecha"); }, tipo: "fecha", activo: sinActual },
        { id: "incluir_sin_stock", get label() { return tAlmacen("informe_inventario.incluirSinStock"); }, tipo: "casilla" },
    ],
    [combo("orden_almacen", () => tAlmacen("informe_inventario.almacenesPor"), ORDENES_ALMACEN), combo("tipo_orden_almacen", () => tAlmacen("informe_inventario.orden"), SENTIDOS)],
    [combo("orden_articulo", () => tAlmacen("informe_inventario.articulosPor"), ORDENES_ARTICULO), combo("tipo_orden_articulo", () => tAlmacen("informe_inventario.orden"), SENTIDOS)],
];

const INICIAL = {
    almacen_id: "",
    familia_id: "",
    marca_id: "",
    actual: true,
    a_fecha: "",
    incluir_sin_stock: true,
    orden_almacen: "No ordenar",
    tipo_orden_almacen: "Ascendente",
    orden_articulo: "No ordenar",
    tipo_orden_articulo: "Ascendente",
};

export const INFORME_INVENTARIO: PestañaInforme = {
    clave: "inventario",
    get titulo() { return tAlmacen("informe_inventario.informeInventario"); },
    url: "/almacen/informe/inventario",
    regla: "almacen.informe_inventario",
    filas: filasComunes,
    inicial: INICIAL,
    ajustar: ajustarInventario,
    Resultado: ResultadoInventario,
};

export const INFORME_INVENTARIO_VALORADO: PestañaInforme = {
    clave: "inventario_valorado",
    get titulo() { return tAlmacen("informe_inventario.informeInventarioValorado"); },
    url: "/almacen/informe/inventario_valorado",
    regla: "almacen.informe_inventario_valorado",
    filas: [
        ...filasComunes,
        [
            combo("tipo_valoracion", () => tAlmacen("informe_inventario.valoracion"), VALORACIONES),
            { id: "por_pvp", get label() { return tAlmacen("informe_inventario.sobrePvp"); }, tipo: "decimal" },
        ],
    ],
    inicial: { ...INICIAL, tipo_valoracion: "Coste medio", por_pvp: "0" },
    ajustar: ajustarInventario,
    Resultado: ResultadoInventario,
};
