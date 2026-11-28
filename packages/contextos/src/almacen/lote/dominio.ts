import { EstadoEtiqueta } from "#/comun/diseño.ts";
import { FormEtiquetaLote, FormatoEtiquetaLote, Lote, OpcionesEtiquetaLote } from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

export const ESTADOS_LOTE = [
    { valor: "PTE", get descripcion() { return tAlmacen("lote.pendiente"); } },
    { valor: "TERMINADO", get descripcion() { return tAlmacen("lote.terminado"); } },
];

/** Píldora del estado del lote: pendiente de recibir o terminado. */
export const etiquetaEstadoLote = (estado: string | null | undefined): EstadoEtiqueta =>
    estado === "TERMINADO"
        ? { texto: tAlmacen("lote.terminado"), tono: "completado" }
        : estado === "PTE"
            ? { texto: tAlmacen("lote.pendiente"), tono: "pendiente" }
            : { texto: estado || "—", tono: "borrador" };

/** Cantidad en formato español (hasta 3 decimales); vacía si no hay. */
export const formatearCantidad = (valor: number | string | null | undefined): string => {
    if (valor === null || valor === undefined || valor === "") return "";
    const numero = Number(valor);
    if (Number.isNaN(numero)) return String(valor);
    return numero.toLocaleString("es-ES", { maximumFractionDigits: 3 });
};

/** Fecha de la API ("AAAA-MM-DD") en dd/mm/aaaa, sin pasar por `Date` (sin desfases de zona). */
export const fechaDdMmAaaa = (fecha: string | null | undefined): string => {
    if (!fecha) return "";
    const [a, m, d] = fecha.slice(0, 10).split("-");
    return a && m && d ? `${d}/${m}/${a}` : fecha;
};

export const loteVacio = (): Lote => ({
    id: "", sku: "", articulo: "", caducidad: "", enAlmacen: 0, produccion: null,
});

/** "Código · artículo". */
export const tituloLote = (lote: Lote): string =>
    lote.articulo ? `${lote.id} · ${lote.articulo}` : lote.id;

/** Texto del artículo: "referencia - descripción". */
export const textoArticulo = (lote: Pick<Lote, "sku" | "articulo">): string =>
    lote.articulo ? `${lote.sku} - ${lote.articulo}` : lote.sku;

/** Mensaje tras «Revisar lote» o «Revisar todos». */
export const mensajeRevisados = (revisados: number): string =>
    revisados === 1 ? tAlmacen("lote.seHaRevisado1Lote") : tAlmacen("lote.seHanRevisadoRevisadosLotes", { revisados: formatearCantidad(revisados) });

export const FORMATOS_ETIQUETA_LOTE: { valor: FormatoEtiquetaLote; descripcion: string }[] = [
    { valor: "3x9", get descripcion() { return tAlmacen("lote.t39Cm"); } },
    { valor: "2,5x6", get descripcion() { return tAlmacen("lote.t256Cm"); } },
];

export const MAX_COPIAS_ETIQUETA = 500;

/** Una copia en el formato de siempre y sin cantidad (la pone el servidor). */
export const formEtiquetaPorDefecto = (): FormEtiquetaLote => ({ copias: "1", formato: "3x9", cantidad: "" });

/** «1.234,5» o «12,5» (español) y también «12.5». */
const numeroTecleado = (texto: string): number => {
    const t = texto.trim();
    return Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t);
};

/** El formulario de etiquetas a lo que se pide, o el motivo por el que no vale. */
export const opcionesEtiquetaDesdeForm = (form: FormEtiquetaLote): OpcionesEtiquetaLote | string => {
    const copias = Number(form.copias.trim());
    if (!Number.isInteger(copias) || copias < 1 || copias > MAX_COPIAS_ETIQUETA) {
        return tAlmacen("lote.lasCopiasDebenSerUnNumero", { MAX_COPIAS_ETIQUETA });
    }
    if (!FORMATOS_ETIQUETA_LOTE.some((f) => f.valor === form.formato)) return tAlmacen("lote.formatoDeEtiquetaNoValido");
    let cantidad: number | null = null;
    if (form.cantidad.trim() !== "") {
        cantidad = numeroTecleado(form.cantidad);
        if (Number.isNaN(cantidad) || cantidad < 0) return tAlmacen("lote.laCantidadDebeSerUnNumero");
    }
    return { copias, formato: form.formato, cantidad };
};

/** Parámetros de la petición de etiquetas (`copias`, `formato` y, si se indica, `cantidad`). */
export const queryEtiquetaLote = (opciones: OpcionesEtiquetaLote): string => {
    const params = new URLSearchParams({ copias: String(opciones.copias), formato: opciones.formato });
    if (opciones.cantidad !== null) params.set("cantidad", String(opciones.cantidad));
    return params.toString();
};

/** Nombre del PDF de etiquetas (el que da el servidor). */
export const nombreEtiquetaLote = (id: string): string => tAlmacen("lote.etiquetaLoteIdPdf", { id });
