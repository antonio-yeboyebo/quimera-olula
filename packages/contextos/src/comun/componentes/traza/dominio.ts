import { formatearFechaString, formatearMoneda } from "@olula/lib/dominio.ts";
import {
    AristaTraza,
    ColumnaTraza,
    DatoResumen,
    DatosDocumentoTraza,
    GrafoTraza,
    NodoTraza,
    TipoDocumentoTraza,
    UrlPorId,
    UrlsTraza,
} from "./diseño.ts";
import { tComun } from "../../i18n/index.ts";

/** Columnas del grafo, en el orden en que se generan los documentos. */
const COLUMNAS: { id: string; titulo: string; tipos: TipoDocumentoTraza[] }[] = [
    { id: "presupuesto", get titulo() { return tComun("componentes.presupuestos"); }, tipos: ["presupuesto_venta"] },
    { id: "pedido", get titulo() { return tComun("componentes.pedidos"); }, tipos: ["pedido_venta", "pedido_compra"] },
    { id: "albaran", get titulo() { return tComun("componentes.albaranes"); }, tipos: ["albaran_venta", "albaran_compra"] },
    { id: "factura", get titulo() { return tComun("componentes.facturas"); }, tipos: ["factura_venta", "factura_compra"] },
    { id: "recibo", get titulo() { return tComun("componentes.recibos"); }, tipos: ["recibo_cobro", "recibo_pago"] },
    { id: "pago", get titulo() { return tComun("componentes.pagos"); }, tipos: ["pago_cobro"] },
];

const NOMBRES_TIPO: Record<TipoDocumentoTraza, string> = {
    get presupuesto_venta() { return tComun("componentes.presupuestoDeVenta"); },
    get pedido_venta() { return tComun("componentes.pedidoDeVenta"); },
    get albaran_venta() { return tComun("componentes.albaranDeVenta"); },
    get factura_venta() { return tComun("componentes.facturaDeVenta"); },
    get recibo_cobro() { return tComun("componentes.reciboDeCobro"); },
    get pago_cobro() { return tComun("componentes.pagoDevolucion"); },
    get pedido_compra() { return tComun("componentes.pedidoDeCompra"); },
    get albaran_compra() { return tComun("componentes.albaranDeCompra"); },
    get factura_compra() { return tComun("componentes.facturaDeCompra"); },
    get recibo_pago() { return tComun("componentes.reciboDePago"); },
};

const URLS_POR_DEFECTO: Record<TipoDocumentoTraza, UrlPorId | null> = {
    presupuesto_venta: (id) => `/ventas/presupuesto?id=${id}`,
    pedido_venta: (id) => `/ventas/pedido?id=${id}`,
    albaran_venta: (id) => `/ventas/albaran?id=${id}`,
    factura_venta: (id) => `/ventas/factura?id=${id}`,
    recibo_cobro: (id) => `/tesoreria/recibo_venta?id=${id}`,
    pago_cobro: null,
    pedido_compra: (id) => `/compras/pedido?id=${id}`,
    albaran_compra: (id) => `/compras/albaran?id=${id}`,
    factura_compra: (id) => `/compras/factura?id=${id}`,
    recibo_pago: (id) => `/tesoreria/recibo_compra?id=${id}`,
};

const columnaDeTipo = (tipo: TipoDocumentoTraza): number =>
    COLUMNAS.findIndex((columna) => columna.tipos.includes(tipo));

const claveDe = (datos: DatosDocumentoTraza): string => `${datos.tipo}:${datos.id}`;

const esDatosDocumento = (valor: unknown): valor is DatosDocumentoTraza =>
    typeof valor === "object" &&
    valor !== null &&
    !Array.isArray(valor) &&
    typeof (valor as DatosDocumentoTraza).tipo === "string" &&
    typeof (valor as DatosDocumentoTraza).id === "string";

/**
 * Convierte la respuesta anidada de `.../traza` en un grafo.
 *
 * Cada nivel de la respuesta es `{ <documento>: datos, <relacionados>: [niveles] }`:
 * el valor que tiene `tipo` e `id` son los datos y cada lista son documentos
 * relacionados, sean padres o hijos. La dirección de la arista no depende de
 * por dónde se llegue, sino del orden de la cadena (presupuesto → … → pago).
 * Un documento al que se llega por dos caminos es un único nodo.
 */
export const grafoDesdeTraza = (respuesta: unknown): GrafoTraza => {
    const nodos = new Map<string, NodoTraza>();
    const aristas = new Map<string, AristaTraza>();

    const recorrer = (nivel: unknown): string => {
        const valores = Object.values(nivel as Record<string, unknown>);
        const datos = valores.find(esDatosDocumento);
        if (!datos) throw new Error(tComun("componentes.laTrazaNoTraeLosDatos"));

        const clave = claveDe(datos);
        if (!nodos.has(clave)) nodos.set(clave, { clave, datos });

        valores.filter(Array.isArray).flat().forEach((relacionado) => {
            const claveRelacionado = recorrer(relacionado);
            const [desde, hasta] =
                columnaDeTipo(datos.tipo) <= columnaDeTipo(nodos.get(claveRelacionado)!.datos.tipo)
                    ? [clave, claveRelacionado]
                    : [claveRelacionado, clave];
            aristas.set(`${desde}>${hasta}`, { desde, hasta });
        });

        return clave;
    };

    const raiz = recorrer(respuesta);

    return { raiz, nodos: [...nodos.values()], aristas: [...aristas.values()] };
};

const media = (valores: number[]): number =>
    valores.reduce((suma, valor) => suma + valor, 0) / valores.length;

/** Pasadas de ida y vuelta para ordenar las columnas; con dos se estabiliza. */
const PASADAS_ORDEN = 2;

const porCodigo = (a: NodoTraza, b: NodoTraza): number =>
    a.datos.codigo.localeCompare(b.datos.codigo, "es");

/**
 * Columnas con documentos, en orden de la cadena, con la fila de cada nodo.
 *
 * 1. Orden dentro de cada columna: se parte del código y se reordena por el
 *    baricentro (la posición media de sus relacionados en la columna vecina),
 *    de izquierda a derecha y de vuelta. Así los hijos de un mismo documento
 *    quedan juntos y cada rama ocupa su franja, sin cruzarse con las demás.
 * 2. Altura: la columna con más documentos (el ancla) va en filas enteras; en
 *    empate, la más alejada del documento de partida, porque la traza se abre
 *    hacia fuera. Desde ella, cada columna se centra en sus relacionados de la
 *    columna vecina hacia el ancla, así que un documento queda en medio de su
 *    bloque (la fila puede ser fraccionaria). Si dos documentos quedan a menos
 *    de una fila, el de abajo se desplaza, y el que no tiene relacionados hacia
 *    el ancla va detrás de su hermano anterior.
 */
export const layoutPorColumnas = (grafo: GrafoTraza): ColumnaTraza[] => {
    const vecinos = new Map<string, Set<string>>();
    grafo.aristas.forEach(({ desde, hasta }) => {
        vecinos.set(desde, (vecinos.get(desde) ?? new Set()).add(hasta));
        vecinos.set(hasta, (vecinos.get(hasta) ?? new Set()).add(desde));
    });

    const columnas = COLUMNAS.map((columna) => ({
        id: columna.id,
        titulo: columna.titulo,
        nodos: grafo.nodos.filter((nodo) => columna.tipos.includes(nodo.datos.tipo)).sort(porCodigo),
    })).filter((columna) => columna.nodos.length > 0);

    const posicionesEn = (clave: string, posiciones: Map<string, number>): number[] =>
        [...(vecinos.get(clave) ?? [])].filter((vecino) => posiciones.has(vecino)).map((vecino) => posiciones.get(vecino)!);

    // Los que no tienen relacionados en la columna de referencia se quedan en su
    // hueco; el resto se reordena entre sus huecos por baricentro.
    const reordenar = (indice: number, referencia: number) => {
        const posiciones = new Map(columnas[referencia].nodos.map((nodo, posicion) => [nodo.clave, posicion]));
        const nodos = columnas[indice].nodos;
        const conRelacionados = nodos
            .map((nodo, posicion) => ({ nodo, posicion, relacionados: posicionesEn(nodo.clave, posiciones) }))
            .filter(({ relacionados }) => relacionados.length > 0);
        const ordenados = [...conRelacionados]
            .sort((a, b) => media(a.relacionados) - media(b.relacionados) || a.posicion - b.posicion);

        const resultado = [...nodos];
        conRelacionados.forEach(({ posicion }, orden) => { resultado[posicion] = ordenados[orden].nodo; });
        columnas[indice].nodos = resultado;
    };

    for (let pasada = 0; pasada < PASADAS_ORDEN; pasada++) {
        for (let indice = 1; indice < columnas.length; indice++) reordenar(indice, indice - 1);
        for (let indice = columnas.length - 2; indice >= 0; indice--) reordenar(indice, indice + 1);
    }

    const columnaRaiz = columnas.findIndex((columna) => columna.nodos.some((nodo) => nodo.clave === grafo.raiz));
    const ancla = columnas.reduce((mejor, columna, indice) => {
        const actual = columnas[mejor];
        const masNodos = columna.nodos.length - actual.nodos.length;
        const masLejos = Math.abs(indice - columnaRaiz) - Math.abs(mejor - columnaRaiz);
        return masNodos > 0 || (masNodos === 0 && masLejos > 0) ? indice : mejor;
    }, 0);

    const filas = new Map<string, number>();
    columnas[ancla].nodos.forEach((nodo, fila) => filas.set(nodo.clave, fila));

    const colocar = (indice: number, referencia: number) => {
        const posiciones = new Map(columnas[referencia].nodos.map((nodo) => [nodo.clave, filas.get(nodo.clave)!]));
        let anterior = -1;
        columnas[indice].nodos.forEach((nodo) => {
            const relacionados = posicionesEn(nodo.clave, posiciones);
            const deseada = relacionados.length > 0 ? media(relacionados) : anterior + 1;
            anterior = Math.max(deseada, anterior + 1);
            filas.set(nodo.clave, anterior);
        });
    };

    for (let indice = ancla + 1; indice < columnas.length; indice++) colocar(indice, indice - 1);
    for (let indice = ancla - 1; indice >= 0; indice--) colocar(indice, indice + 1);

    return columnas.map((columna) => ({
        ...columna,
        nodos: columna.nodos.map((nodo) => ({ ...nodo, fila: filas.get(nodo.clave)! })),
    }));
};

export const nombreTipo = (tipo: TipoDocumentoTraza): string => NOMBRES_TIPO[tipo];

/** Texto del nodo en el grafo. Un pago no tiene código propio: se nombra por su tipo y fecha. */
export const etiquetaNodo = (datos: DatosDocumentoTraza): string =>
    datos.tipo === "pago_cobro" && datos.visible
        ? `${texto(datos.tipo_pago) ?? tComun("componentes.pago")} ${datos.fecha ? formatearFechaString(datos.fecha) : ""}`.trim()
        : datos.codigo;

const APROBACION: Record<string, string> = {
    get PENDIENTE() { return tComun("componentes.pendiente"); },
    get PARCIAL() { return tComun("componentes.parcial"); },
    get TOTAL() { return tComun("componentes.aprobado"); },
};

const texto = (valor: unknown): string | null =>
    valor === null || valor === undefined || valor === "" ? null : String(valor);

const tercero = (id: unknown, nombre: unknown): string | null =>
    [texto(id), texto(nombre)].filter(Boolean).join(" · ") || null;

const importe = (valor: unknown, divisa: unknown): string | null =>
    typeof valor === "number" ? formatearMoneda(valor, texto(divisa) ?? "EUR") : null;

/** Datos del documento seleccionado que se enseñan en el panel. */
export const resumenDocumento = (datos: DatosDocumentoTraza): DatoResumen[] => {
    if (!datos.visible) return [];

    const candidatos: [string, string | null][] = [
        [tComun("componentes.tipo"), texto(datos.tipo_pago)],
        [tComun("componentes.recibo"), datos.tipo === "pago_cobro" ? datos.codigo : null],
        [tComun("componentes.cliente"), tercero(datos.cliente_id, datos.nombre_cliente)],
        [tComun("componentes.proveedor"), tercero(datos.proveedor_id, datos.nombre_proveedor)],
        [tComun("componentes.fecha"), datos.fecha ? formatearFechaString(datos.fecha) : null],
        [tComun("componentes.total"), importe(datos.total, datos.divisa_id)],
        [tComun("componentes.importe"), importe(datos.importe, datos.divisa_id)],
        [tComun("componentes.estado"), texto(datos.estado)],
        [tComun("componentes.aprobacion"), APROBACION[String(datos.estado_aprobado)] ?? null],
        [tComun("componentes.servido"), texto(datos.servido)],
        [tComun("componentes.recibido"), texto(datos.recibido)],
    ];

    return candidatos
        .filter((candidato): candidato is [string, string] => candidato[1] !== null)
        .map(([etiqueta, valor]) => ({ etiqueta, valor }));
};

/**
 * Dónde se abre un documento, o null si no tiene pantalla propia (los pagos).
 * La app puede cambiar la url de cualquier tipo, o dejarlo sin pantalla con null.
 */
export const urlDocumento = (
    tipo: TipoDocumentoTraza,
    id: string,
    urls: UrlsTraza = {}
): string | null => {
    const url = tipo in urls ? urls[tipo] : URLS_POR_DEFECTO[tipo];
    return url ? url(id) : null;
};
