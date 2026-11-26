import { EstadoEtiqueta } from "#/comun/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { tCompras } from "#/compras/i18n/index.ts";
import { articuloDeLineaValido, getTipoArticulo } from "../comun/dominio.ts";
import {
    Albaran,
    LineaAlbaran,
    ModeloLineaAlbaran,
    NuevaLineaAlbaran,
} from "./diseño.ts";

export const albaranFacturado = (albaran: Albaran): boolean => albaran.facturaId !== null;

export const descripcionEstadoFactura = (albaran: Albaran): string =>
    albaranFacturado(albaran)
        ? tCompras("comun.documento.estados.facturado")
        : tCompras("comun.documento.estados.pendienteFacturar");

export const etiquetaLinea = (linea: LineaAlbaran): string =>
    linea.referencia ? `${linea.referencia}: ${linea.descripcion}` : linea.descripcion;

export const lineaDePedido = (linea: LineaAlbaran): boolean => linea.pedidoId !== null;

export const modeloLineaAlbaran = (linea: LineaAlbaran): ModeloLineaAlbaran => ({
    ...linea,
    tipoArticulo: getTipoArticulo(linea),
});

export const metaLineaAlbaran: MetaModelo<ModeloLineaAlbaran> = {
    campos: {
        descripcion: { requerido: true },
        cantidad: { requerido: true, tipo: "decimal", decimales: 2 },
        pvpUnitario: { requerido: true, tipo: "moneda", decimales: 2 },
        dtoPorcentual: { tipo: "decimal", decimales: 2 },
        dtoLineal: { tipo: "moneda", decimales: 2 },
        tipoIrpf: { tipo: "decimal", decimales: 2 },
        pvpSinDto: { tipo: "moneda", bloqueado: true },
        pvpTotal: { tipo: "moneda", bloqueado: true },
        tipoIva: { tipo: "decimal", bloqueado: true },
        tipoRecargo: { tipo: "decimal", bloqueado: true },
    },
    validacion: articuloDeLineaValido,
};

export const metaNuevaLineaAlbaran: MetaModelo<NuevaLineaAlbaran> = {
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

export const nuevaLineaAlbaranVacia = (): NuevaLineaAlbaran => ({
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
] as const satisfies readonly (keyof NuevaLineaAlbaran)[];

export const etiquetaEstadoAlbaran = (albaran: Albaran): EstadoEtiqueta =>
    albaranFacturado(albaran)
        ? { texto: tCompras("comun.documento.estados.facturado"), tono: "completado" }
        : { texto: tCompras("comun.documento.estados.pendiente"), tono: "pendiente" };
