import { formatearMoneda, formatearNumero } from "@olula/lib/dominio.ts";
import {
    AlertaImportacion,
    AlertaLineaImportacion,
    AlbaranCandidato,
    FacturaLeida,
    LineaFacturaLeida,
    LineaPropuesta,
    NuevoArticuloConProveedor,
    PropuestaImportacion,
    TipoFicheroOriginal,
} from "./diseño.ts";

const etiquetasAlerta: Record<AlertaImportacion, string> = {
    sin_proveedor: "Falta el proveedor",
    total_discordante: "El total leído no coincide con el calculado",
    lineas_sin_albaran: "Hay líneas de la factura que no vienen de los albaranes seleccionados",
};

const etiquetasAlertaLinea: Record<AlertaLineaImportacion, string> = {
    sin_articulo: "Sin artículo",
    sin_subcuenta: "Sin subcuenta",
    sin_coste_proveedor: "Sin coste de proveedor",
    precio_distinto: "Precio distinto al teórico",
    dto_distinto: "Descuento distinto al teórico",
    sin_precio: "Sin precio",
    sin_albaran: "No viene de ningún albarán seleccionado",
};

export const etiquetaAlerta = (alerta: string): string =>
    etiquetasAlerta[alerta as AlertaImportacion] ?? alerta;

export const etiquetaAlertaLinea = (alerta: string): string =>
    etiquetasAlertaLinea[alerta as AlertaLineaImportacion] ?? alerta;

export const hayTotalDiscordante = (propuesta: PropuestaImportacion | null): boolean =>
    propuesta?.alertas.includes("total_discordante") ?? false;

const vacio = (valor: string | null | undefined): boolean =>
    valor === null || valor === undefined || valor.trim() === "";

/** Diferencia precio leído - precio teórico, o null si falta alguno. */
export const diferenciaPrecio = (linea: LineaPropuesta): number | null => {
    if (linea.precioLeido === null || linea.precioTeorico === null) return null;
    return Math.round((Number(linea.precioLeido) - Number(linea.precioTeorico)) * 10000) / 10000;
};

const SIN_VALOR = "—";

const aNumero = (valor: number | string | null | undefined): number | null => {
    if (valor === null || valor === undefined || valor === "") return null;
    const n = Number(valor);
    return Number.isNaN(n) ? null : n;
};

/** Mismo formato local que los QInput: importes en moneda, precios con 4
 * decimales y cantidades y descuentos con 2. */
// Misma tolerancia que el servidor para el aviso de total discordante.
const TOLERANCIA_TOTAL = 0.02;

export type EstadoTotal = "ok" | "error" | null;

/** Si un total cuadra con el leído; null si falta alguno de los dos. */
export const estadoTotal = (
    leido: number | null | undefined,
    otro: number | null | undefined,
): EstadoTotal => {
    if (leido === null || leido === undefined || otro === null || otro === undefined) {
        return null;
    }
    return Math.abs(leido - otro) <= TOLERANCIA_TOTAL ? "ok" : "error";
};

export const formatearImporte = (valor: number | string | null | undefined): string => {
    const n = aNumero(valor);
    return n === null ? SIN_VALOR : formatearMoneda(n, "EUR");
};

export const formatearPrecio = (valor: number | string | null | undefined): string => {
    const n = aNumero(valor);
    return n === null ? SIN_VALOR : formatearNumero(n, 4);
};

export const formatearCantidad = (valor: number | string | null | undefined): string => {
    const n = aNumero(valor);
    return n === null ? SIN_VALOR : formatearNumero(n, 2);
};

export const formatearDescuento = (valor: number | string | null | undefined): string => {
    const n = aNumero(valor);
    return n === null ? SIN_VALOR : `${formatearNumero(n, 2)} %`;
};

/** Motivos por los que no se puede confirmar la importación (vacío = se puede). */
export const motivosNoConfirmable = (
    leida: FacturaLeida,
    propuesta: PropuestaImportacion | null,
): string[] => {
    const motivos: string[] = [];
    if (!propuesta) return ["Propuesta no calculada"];

    if (vacio(leida.proveedorId)) motivos.push("Falta el proveedor");
    if (leida.lineas.length === 0) motivos.push("La factura no tiene líneas");

    leida.lineas.forEach((l, i) => {
        if (vacio(l.descripcion) || vacio(l.cantidad)) {
            motivos.push(`Línea ${i + 1}: falta descripción o cantidad`);
        }
        if (vacio(l.articuloId) && vacio(l.precioUnitario)) {
            motivos.push(`Línea ${i + 1}: sin artículo y sin precio`);
        }
    });

    if (propuesta.albaranes.some((a) => a.seleccionado && !a.coincide)) {
        motivos.push("Hay albaranes seleccionados que no coinciden");
    }

    propuesta.lineas
        .filter((pl) => pl.alertas.includes("sin_albaran"))
        .forEach((pl) => motivos.push(`Línea ${pl.indice + 1}: no viene de ningún albarán seleccionado`));

    if (hayTotalDiscordante(propuesta) && leida.aceptarTotalDiscordante !== true) {
        motivos.push("Hay que aceptar la diferencia de total");
    }
    return motivos;
};

export const puedeConfirmar = (
    leida: FacturaLeida,
    propuesta: PropuestaImportacion | null,
): boolean => motivosNoConfirmable(leida, propuesta).length === 0;

export const albaranIdsSeleccionados = (albaranes: AlbaranCandidato[]): string[] =>
    albaranes.filter((a) => a.seleccionado).map((a) => a.id);

/** Selección explícita de albaranes tras marcar/desmarcar uno. */
export const alternarAlbaran = (
    albaranes: AlbaranCandidato[],
    albaranId: string,
    marcado: boolean,
): string[] => {
    const resto = albaranIdsSeleccionados(albaranes).filter((id) => id !== albaranId);
    return marcado ? [...resto, albaranId] : resto;
};

export const cambiarLinea = (
    leida: FacturaLeida,
    indice: number,
    cambios: Partial<LineaFacturaLeida>,
): FacturaLeida => ({
    ...leida,
    lineas: leida.lineas.map((l, i) => (i === indice ? { ...l, ...cambios } : l)),
});

/** Descripción de la línea de albarán enlazada a una línea de factura. */
export const textoAlbaranLinea = (
    albaranes: AlbaranCandidato[],
    albaranLineaId: string | null,
): string => {
    if (!albaranLineaId) return "";
    for (const a of albaranes) {
        const l = a.lineas.find((x) => x.id === albaranLineaId);
        if (l) return `${a.codigo} · ${l.descripcion}`;
    }
    return "";
};

export const porcentaje = (cobertura: number): string =>
    `${formatearNumero(Math.round(cobertura * 100), 0)} %`;

export type NuevoArticuloImportacion = {
    referencia: string;
    descripcion: string;
    grupoIvaProductoId: string;
    datoContable: string;
    costeIgualPrecio: boolean;
};

export const nuevoArticuloDesdeLinea = (
    linea: LineaFacturaLeida,
    grupoIvaProductoId = "",
): NuevoArticuloImportacion => ({
    referencia: linea.refArticulo || linea.refProveedor || "",
    descripcion: linea.descripcion ?? "",
    grupoIvaProductoId,
    datoContable: "",
    costeIgualPrecio: true,
});

export const costeDeArticulo = (
    nuevo: NuevoArticuloImportacion,
    linea: LineaFacturaLeida,
): number => {
    if (!nuevo.costeIgualPrecio) return 0;
    const precio = Number(linea.precioUnitario);
    return Number.isNaN(precio) ? 0 : precio;
};

export const articuloConProveedorDesdeFormulario = (
    nuevo: NuevoArticuloImportacion,
    linea: LineaFacturaLeida,
    proveedorId: string,
): NuevoArticuloConProveedor => ({
    id: nuevo.referencia.trim(),
    descripcion: nuevo.descripcion.trim(),
    grupoIvaProductoId: nuevo.grupoIvaProductoId,
    datoContable: nuevo.datoContable.trim() === "" ? null : nuevo.datoContable.trim(),
    proveedorId,
    refProveedor: linea.refProveedor ?? nuevo.referencia.trim(),
    coste: costeDeArticulo(nuevo, linea),
});

/** PDF o imagen, por su tipo MIME o, si no lo hay, por la extensión del nombre. */
export const tipoFichero = (mimeONombre: string | null | undefined): TipoFicheroOriginal => {
    const valor = (mimeONombre ?? "").toLowerCase();
    if (valor.startsWith("image/")) return "imagen";
    if (/\.(jpe?g|png|gif|webp)$/.test(valor)) return "imagen";
    return "pdf";
};

export type ResumenImportacion = {
    proveedor: string;
    numeroProveedor: string;
    fecha: string;
    totalLeido: number | null;
    totalCalculado: number | null;
    estadoTotal: EstadoTotal;
    diferenciaAceptada: boolean;
    numLineas: number;
    albaranes: string[];
    avisos: string[];
};

const plural = (n: number, singular: string, plural: string): string =>
    `${n} ${n === 1 ? singular : plural}`;

/** Lo que se va a crear, para la última comprobación antes de importar. */
export const resumenImportacion = (
    leida: FacturaLeida,
    propuesta: PropuestaImportacion,
): ResumenImportacion => {
    const cuenta = (alerta: AlertaLineaImportacion) =>
        propuesta.lineas.filter((l) => l.alertas.includes(alerta)).length;
    const aCompra = propuesta.lineas.filter(
        (l) => l.subcuenta?.origen === "cuenta_especial",
    ).length;

    const avisos = [
        aCompra > 0 &&
            `${plural(aCompra, "línea irá", "líneas irán")} a la cuenta especial de compras`,
        cuenta("sin_articulo") > 0 &&
            `${plural(cuenta("sin_articulo"), "línea", "líneas")} sin artículo`,
        cuenta("precio_distinto") > 0 &&
            `${plural(cuenta("precio_distinto"), "línea", "líneas")} con precio distinto al teórico`,
        cuenta("dto_distinto") > 0 &&
            `${plural(cuenta("dto_distinto"), "línea", "líneas")} con descuento distinto al teórico`,
        cuenta("sin_coste_proveedor") > 0 &&
            `${plural(cuenta("sin_coste_proveedor"), "línea", "líneas")} sin coste de proveedor`,
    ].filter((a): a is string => Boolean(a));

    return {
        proveedor: leida.proveedorNombre ?? leida.proveedorId ?? "",
        numeroProveedor: leida.numeroProveedor ?? "",
        fecha: leida.fecha ?? "",
        totalLeido: propuesta.totalLeido,
        totalCalculado: propuesta.totalCalculado,
        estadoTotal: estadoTotal(propuesta.totalLeido, propuesta.totalCalculado),
        diferenciaAceptada:
            hayTotalDiscordante(propuesta) && leida.aceptarTotalDiscordante === true,
        numLineas: leida.lineas.length,
        albaranes: propuesta.albaranes.filter((a) => a.seleccionado).map((a) => a.codigo),
        avisos,
    };
};
