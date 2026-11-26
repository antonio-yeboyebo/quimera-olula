import { EstadoEtiqueta } from "#/comun/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { tCompras } from "#/compras/i18n/index.ts";
import { articuloDeLineaValido, getTipoArticulo } from "../comun/dominio.ts";
import {
    EstadoExpedicion,
    Factura,
    LineaFactura,
    ModeloLineaFactura,
    NuevaLineaFactura,
} from "./diseño.ts";

export const facturaEditable = (factura: Factura): boolean => factura.editable;

const ESTADOS_EXPEDICION: Record<string, EstadoExpedicion> = {
    BORRADOR: "BORRADOR",
    REGISTRADA: "REGISTRADA",
};

/**
 * Normaliza lo que manda el servidor antes de compararlo. Sin esto, un
 * "Borrador" en vez de "BORRADOR" no casaría con ninguna rama y la factura se
 * trataría como no registrable.
 */
export const estadoExpedicionDesdeApi = (
    valor: string | null | undefined
): EstadoExpedicion => {
    const clave = (valor ?? "").trim().toUpperCase().replace(/[\s.-]+/g, "_");
    return ESTADOS_EXPEDICION[clave] ?? "";
};

const CLAVE_ESTADO_EXPEDICION = {
    "": "sinCargar",
    BORRADOR: "borrador",
    REGISTRADA: "registrada",
} as const satisfies Record<EstadoExpedicion, string>;

/** Descripción del estado de expedición en el idioma activo. */
export const descripcionEstadoExpedicion = (estado: EstadoExpedicion): string =>
    tCompras(`comun.documento.estados.${CLAVE_ESTADO_EXPEDICION[estado]}`);

/** Solo se registra el borrador: registrar es irreversible. */
export const facturaRegistrable = (factura: Factura): boolean =>
    factura.estadoExpedicion === "BORRADOR";

export const descripcionOrigenFactura = (factura: Factura): string =>
    tCompras(factura.automatica ? "comun.documento.estados.desdeAlbaranes" : "comun.documento.estados.manual");

export const etiquetaLinea = (linea: LineaFactura): string =>
    linea.referencia ? `${linea.referencia}: ${linea.descripcion}` : linea.descripcion;

export const lineaDeAlbaran = (linea: LineaFactura): boolean => linea.albaranId !== null;

export const modeloLineaFactura = (linea: LineaFactura): ModeloLineaFactura => ({
    ...linea,
    tipoArticulo: getTipoArticulo(linea),
});

export const metaLineaFactura: MetaModelo<ModeloLineaFactura> = {
    campos: {
        descripcion: { requerido: true },
        cantidad: { requerido: true, tipo: "decimal", decimales: 2 },
        pvpUnitario: { requerido: true, tipo: "moneda", decimales: 2 },
        dtoPorcentual: { tipo: "decimal", decimales: 2 },
        dtoLineal: { tipo: "moneda", decimales: 2 },
        tipoIrpf: { tipo: "decimal", decimales: 2 },
        codigoAlbaran: { bloqueado: true },
        pvpSinDto: { tipo: "moneda", bloqueado: true },
        pvpTotal: { tipo: "moneda", bloqueado: true },
        tipoIva: { tipo: "decimal", bloqueado: true },
        tipoRecargo: { tipo: "decimal", bloqueado: true },
    },
    validacion: articuloDeLineaValido,
};

export const metaNuevaLineaFactura: MetaModelo<NuevaLineaFactura> = {
    campos: {
        referencia: { tipo: "texto" },
        descripcion: { tipo: "texto" },
        cantidad: { requerido: true, tipo: "decimal", decimales: 2 },
        pvpUnitario: { tipo: "moneda", decimales: 2 },
        dtoPorcentual: { tipo: "decimal", decimales: 2, positivo: true, maximo: 100 },
        dtoLineal: { tipo: "moneda", decimales: 2, positivo: true },
        tipoIrpf: { tipo: "decimal", decimales: 2, positivo: true, maximo: 100 },
        pvpTotal: { tipo: "moneda", bloqueado: true },
        tipoIva: { tipo: "decimal", decimales: 2, bloqueado: true },
        tipoRecargo: { tipo: "decimal", decimales: 2, bloqueado: true },
    },
    validacion: articuloDeLineaValido,
};

export const nuevaLineaFacturaVacia = (): NuevaLineaFactura => ({
    tipoArticulo: "registrado",
    referencia: null,
    descripcion: "",
    descripcionArticulo: null,
    cantidad: 1,
    pvpUnitario: null,
    dtoPorcentual: 0,
    dtoLineal: 0,
    pvpTotal: 0,
    grupoIvaProductoId: null,
    ivaIncluido: false,
    tipoIva: 0,
    tipoRecargo: 0,
    tipoIrpf: 0,
});

/**
 * Campos cuyo cambio obliga a recalcular la línea en el servidor. El resto se
 * edita en local sin ida y vuelta.
 */
export const camposConCambiosServidor = [
    'referencia',
    'cantidad',
    'pvpUnitario',
    'dtoPorcentual',
    'dtoLineal',
    'tipoIrpf',
    'grupoIvaProductoId',
] as const satisfies readonly (keyof NuevaLineaFactura)[];

export const etiquetaEstadoFactura = (factura: Factura): EstadoEtiqueta => ({
    texto: descripcionEstadoExpedicion(factura.estadoExpedicion),
    tono: factura.estadoExpedicion === "REGISTRADA" ? "completado" : "borrador",
});
