import { EstadoEtiqueta } from "#/comun/diseño.ts";
import { ClausulaFiltro } from "@olula/lib/diseño.ts";
import { MetaModelo, plugin } from "@olula/lib/dominio.ts";
import {
    AgenciaEnvio,
    AlbaranGenerado,
    DiferenciaPedidoOrden,
    ItemOrdenAlmacen,
    LineaOrdenAlmacen,
    MotivoRecorridoFormula,
    NuevoEnvioAgencia,
    OrdenAlmacen,
} from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

/** Textos en español de las validaciones (la validación devuelve su traducción). */
export const ERR_SKU_REQUERIDO = "El SKU es requerido";
export const ERR_CANTIDAD_PREVISTA_REQUERIDA = "La cantidad prevista es requerida";

export const ordenVacia = (): OrdenAlmacen => ({
    id: "",
    fecha: new Date().toISOString().slice(0, 10),
    tipo: "ENTRADA",
    almacenId: "",
    almacen: "",
    abierta: true,
    estado: "",
    descripcion: "",
    idUbicacionOrigen: null,
    ubicacionOrigen: null,
    idCajaOrigen: null,
    idUbicacionDestino: null,
    ubicacionDestino: null,
    idCajaDestino: null,
    lineas: [],
    lecturasCaja: [],
    albaranes: [],
    pasosPick: null,
    pasosDrop: null,
});

export const lineaOrdenVacia = (): LineaOrdenAlmacen => ({
    id: "",
    sku: "",
    articulo: "",
    loteId: null,
    cantidadPrevista: 0,
    idUbicacionOrigen: null,
    ubicacionOrigen: null,
    idCajaOrigen: null,
    cajaOrigen: null,
    idUbicacionDestino: null,
    ubicacionDestino: null,
    idCajaDestino: null,
    cajaDestino: null,
    pedidoVentaId: null,
    pedidoVenta: null,
    cliente: null,
    cambioPedido: null,
    cantidadPedidoAnterior: null,
    lecturas: [],
    porLotes: false,
    idLineaPick: null,
    pasosPick: null,
    pasosDrop: null,
});

const onOrdenCambiada = (orden: OrdenAlmacen, campo: string, _: unknown, otros?: Record<string, unknown>) => {
    if (campo === "idCajaDestino" && otros) {

        const nuevoValor: OrdenAlmacen = {
            ...orden,
            idUbicacionDestino: otros.idUbicacion as string,
            codUbicacionDestino: otros.codUbicacion as string,
        }
        return nuevoValor
    }
    else if (campo === "idCajaOrigen" && otros) {

        const nuevoValor: OrdenAlmacen = {
            ...orden,
            idUbicacionOrigen: otros.idUbicacion as string,
            codUbicacionOrigen: otros.codUbicacion as string,
        }
        return nuevoValor
    }
    return orden
}

export const metaOrden: MetaModelo<OrdenAlmacen> = {
    campos: {
        tipo: { requerido: true },
        almacenId: { requerido: true },
        fecha: { requerido: true },
        abierta: { tipo: "checkbox", requerido: true },
        idCajaOrigen: {},
        idUbicacionOrigen: {},
        idCajaDestino: {},
        idUbicacionDestino: {},
    },
    onChange: onOrdenCambiada
};



export const metaNuevaLinea: MetaModelo<LineaOrdenAlmacen> = {
    campos: {
        sku: {
            validacion: (linea) => {
                if (linea.sku === null || linea.sku === undefined || linea.sku === "") {
                    return tAlmacen("orden.elSkuEsRequerido");
                }
                return true;
            },
        },
        cantidadPrevista: {
            tipo: "numero",
            validacion: (linea) => {
                if (linea.cantidadPrevista === null || linea.cantidadPrevista === undefined) {
                    return tAlmacen("orden.laCantidadPrevistaEsRequerida");
                }
                return true;
            },
        },
    },
};

/** Id del usuario con sesión iniciada (de `whoami` en localStorage), o null. */
export const usuarioActualId = (): string | null => {
    try {
        const raw = localStorage.getItem("whoami");
        return raw ? (JSON.parse(raw) as { usuario_id?: string }).usuario_id ?? null : null;
    } catch {
        return null;
    }
};

/**
 * Una orden se puede adquirir si no está terminada y está libre o ya es del usuario.
 * Adquirir la propia sirve para liberar al usuario del resto de órdenes abiertas.
 */
export const ordenAdquirible = (
    orden: Pick<ItemOrdenAlmacen, "estado" | "idResponsable">,
    usuarioId: string | null,
): boolean =>
    usuarioId !== null &&
    (orden.estado === "PENDIENTE" || orden.estado === "EN_CURSO") &&
    (orden.idResponsable === null || orden.idResponsable === usuarioId);

/**
 * Una SALIDA con todas las lecturas hechas queda PREPARADA: solo pasa a
 * TERMINADA al generar su albarán.
 */
/** Material recogido de más en la línea (el pedido se redujo después de recogerlo). */
export const sobranteLinea = (linea: Pick<LineaOrdenAlmacen, "cantidadPrevista" | "cantidadReal" | "cantidadPick">): number =>
    Math.max(0, Math.max(linea.cantidadReal ?? 0, linea.cantidadPick ?? 0) - linea.cantidadPrevista);

export type PedidoDeOrden = { id: string; codigo: string; cliente: string | null };

/** El pedido de venta de la orden si todas sus líneas con pedido son del mismo; null si no hay o hay varios. */
export const pedidoUnicoDeOrden = (orden: Pick<OrdenAlmacen, "lineas">): PedidoDeOrden | null => {
    const conPedido = orden.lineas.filter((l) => l.pedidoVentaId);
    const ids = new Set(conPedido.map((l) => l.pedidoVentaId));
    if (ids.size !== 1) return null;
    const linea = conPedido[0];
    return {
        id: linea.pedidoVentaId as string,
        codigo: linea.pedidoVenta ?? (linea.pedidoVentaId as string),
        cliente: linea.cliente,
    };
};

/** Texto de la marca de una línea cambiada en el pedido después de generar la salida. */
export const textoCambioPedido = (
    linea: Pick<LineaOrdenAlmacen, "cambioPedido" | "cantidadPedidoAnterior">,
): string | null => {
    switch (linea.cambioPedido) {
        case "ANADIDA":
            return tAlmacen("orden.anadidaEnPedido");
        case "BORRADA":
            return tAlmacen("orden.borradaEnPedido");
        case "CAMBIADA":
            return linea.cantidadPedidoAnterior != null
                ? tAlmacen("orden.cambiadaEnPedidoAntesCantidadpedidoanter", { cantidadPedidoAnterior: linea.cantidadPedidoAnterior })
                : tAlmacen("orden.cambiadaEnPedido");
        default:
            return null;
    }
};

/** Frase del aviso al albaranar para una línea de pedido que no cuadra con la orden. */
export const textoDiferenciaPedido = (d: DiferenciaPedidoOrden): string => {
    const articulo = [d.sku, d.descripcion].filter(Boolean).join(" ");
    const pedido = d.pedido ? `${d.pedido}: ` : "";
    if (d.tipo === "FALTA") {
        const otras = d.enOtrasSalidas > 0 ? tAlmacen("orden.enotrassalidasEnOtrasSalidas", { enOtrasSalidas: d.enOtrasSalidas }) : "";
        return tAlmacen("orden.pedidoArticuloFaltanDiferenciaElPedido", { pedido, articulo, diferencia: d.diferencia, pendientePedido: d.pendientePedido, enOrden: d.enOrden, otras });
    }
    return tAlmacen("orden.pedidoArticuloSobranDiferenciaElPedido", { pedido, articulo, diferencia: d.diferencia, pendientePedido: d.pendientePedido, enOrden: d.enOrden });
};

export const lineasConSobrante = (orden: Pick<OrdenAlmacen, "lineas">): LineaOrdenAlmacen[] =>
    orden.lineas.filter((l) => sobranteLinea(l) > 0);

/** Una salida preparada se albarana; si tiene sobrante, antes hay que devolverlo. */
export const ordenAlbaranable = (
    orden: Pick<OrdenAlmacen, "tipo" | "estado"> & Partial<Pick<OrdenAlmacen, "lineas">>,
): boolean =>
    orden.tipo === "SALIDA" && orden.estado === "PREPARADA" && lineasConSobrante({ lineas: orden.lineas ?? [] }).length === 0;

const ETIQUETAS_ESTADO_ORDEN: Record<string, EstadoEtiqueta> = {
    PENDIENTE: { get texto() { return tAlmacen("orden.pendiente"); }, tono: "borrador" },
    EN_CURSO: { get texto() { return tAlmacen("orden.enCurso"); }, tono: "pendiente" },
    PREPARADA: { get texto() { return tAlmacen("orden.preparada"); }, tono: "parcial" },
    TERMINADA: { get texto() { return tAlmacen("orden.terminada"); }, tono: "completado" },
};

export const etiquetaEstadoOrden = (orden: Pick<OrdenAlmacen, "estado">): EstadoEtiqueta =>
    ETIQUETAS_ESTADO_ORDEN[orden.estado] ?? { texto: orden.estado, tono: "borrador" };

/** Por defecto el maestro muestra solo las órdenes abiertas (incluidas las pendientes de albaranar). */
export const ESTADOS_ORDEN_DEFECTO: string[] = ["EN_CURSO", "PENDIENTE", "PREPARADA"];

export const opcionesEstadoOrden = [
    { valor: "PENDIENTE", get descripcion() { return tAlmacen("orden.pendiente"); } },
    { valor: "EN_CURSO", get descripcion() { return tAlmacen("orden.enCurso"); } },
    { valor: "PREPARADA", get descripcion() { return tAlmacen("orden.preparada"); } },
    { valor: "TERMINADA", get descripcion() { return tAlmacen("orden.terminada"); } },
];

const comoLista = (valor: unknown): string[] =>
    Array.isArray(valor)
        ? valor.map(String).filter(Boolean)
        : typeof valor === "string"
            ? valor.split(",").map((v) => v.trim()).filter(Boolean)
            : [];

export const filtroEstadoOrden = (valor: unknown): ClausulaFiltro | null => {
    const estados = comoLista(valor);
    if (!estados.length) return null;
    return ["estado", "in", estados as unknown as string] as ClausulaFiltro;
};

export const estadosOrdenDesdeFiltro = (filtro: ClausulaFiltro[]): string[] => {
    const clausula = filtro.find(([campo, operador]) => campo === "estado" && operador === "in");
    return clausula ? comoLista(clausula[2]) : [];
};

// Envío por agencia

/** Plugins de agencia de transporte del servidor (comandos/almacen/envio_agencia/agencias.py). */
export const PLUGINS_AGENCIA_ENVIO = ["transporte_dachser", "transporte_correose"];

export const hayAgenciasEnvio = (): boolean =>
    PLUGINS_AGENCIA_ENVIO.some((nombre) => plugin(nombre) === "activo");

export const albaranesSinEnvio = (orden: OrdenAlmacen): AlbaranGenerado[] =>
    orden.albaranes.filter((a) => !a.numeroTracking);

/** Con el plugin `impresion` las etiquetas de caja se mandan directamente a una impresora de red. */
export const impresionEtiquetasActiva = (): boolean => plugin("impresion") === "activo";

export const ordenPermiteEnvio = (orden: OrdenAlmacen, hayAgencias: boolean): boolean =>
    hayAgencias
    && orden.tipo === "SALIDA"
    && orden.estado === "TERMINADA"
    && albaranesSinEnvio(orden).length > 0;

export const metaNuevoEnvioAgencia: MetaModelo<NuevoEnvioAgencia> = {
    campos: {
        albaranId: { requerido: true },
        agenciaId: { requerido: true },
        servicio: { requerido: true },
        bultos: {
            tipo: "entero",
            requerido: true,
            validacion: (m) => (Number.isInteger(m.bultos) && m.bultos > 0)
                || tAlmacen("orden.debeHaberAlMenosUnBulto"),
        },
        kilos: {
            tipo: "decimal",
            requerido: true,
            validacion: (m) => m.kilos > 0 || tAlmacen("orden.losKilosDebenSerMayoresQue"),
        },
        fechaRecogida: { tipo: "fecha", requerido: true },
        observaciones: { requerido: false },
    },
    onChange: (envio, campo) =>
        // Los servicios dependen de la agencia: al cambiarla, se elige de nuevo.
        campo === "agenciaId" ? { ...envio, servicio: "" } : envio,
};

export const nuevoEnvioAgenciaInicial = (
    orden: OrdenAlmacen,
    agencias: AgenciaEnvio[],
): NuevoEnvioAgencia => {
    const pendientes = albaranesSinEnvio(orden);
    const agencia = agencias.length === 1 ? agencias[0] : null;
    return {
        albaranId: pendientes.length === 1 ? pendientes[0].id : "",
        agenciaId: agencia?.codigo ?? "",
        servicio: agencia?.servicios[0]?.codigo ?? "",
        bultos: 1,
        kilos: 1,
        fechaRecogida: new Date(),
        observaciones: "",
    };
};

const plural = (n: number, singular: string, plural: string) => `${n} ${n === 1 ? singular : plural}`;

/** Texto resumen del recorrido: módulos recorridos y pasillos cruzados. */
/** Por qué un recorrido no tiene paradas. */
export const motivoRecorridoVacio = (r: { ordenId: string; estado: string }): string =>
    r.estado === "TERMINADA"
        ? tAlmacen("orden.laOrdenOrdenidEstaTerminadaNo", { ordenId: r.ordenId })
        : tAlmacen("orden.laOrdenOrdenidNoTieneNada", { ordenId: r.ordenId, valor: r.estado ? ` (${r.estado.toLowerCase()})` : "" });

export const textoAccionParada = { get RECOGER() { return tAlmacen("orden.recoger"); }, get DEJAR() { return tAlmacen("orden.dejar"); } } as const;

const textoMotivoRecorrido: Record<MotivoRecorridoFormula, string> = {
    get SIN_PLANTA() { return tAlmacen("orden.elAlmacenNoTienePlanta"); },
    get PARADAS_SIN_POSICION() { return tAlmacen("orden.hayParadasEnPasillosSinColocar"); },
    get SIN_CAMINO() { return tAlmacen("orden.noHayCaminoAPieEntre"); },
};

export const resumenRecorrido = (r: {
    modulosRecorridos: number;
    pasillosCruzados: number;
    calculo?: "DISTANCIA" | "FORMULA";
    motivo?: MotivoRecorridoFormula | null;
    metros?: number | null;
}): string => {
    if (r.calculo === "DISTANCIA" && r.metros != null) {
        return tAlmacen("orden.tolocalestringMAPieOrdenadoPor", { toLocaleString: Math.round(r.metros).toLocaleString("es-ES") });
    }
    const estimado = `${plural(r.modulosRecorridos, tAlmacen("orden.moduloRecorrido"), tAlmacen("orden.modulosRecorridos"))}, ` +
        plural(r.pasillosCruzados, tAlmacen("orden.pasilloCruzado"), tAlmacen("orden.pasillosCruzados"));
    return r.motivo && r.motivo !== "SIN_PLANTA" ? tAlmacen("orden.estimadoEstimadoValor", { estimado, valor: textoMotivoRecorrido[r.motivo] }) : estimado;
};
