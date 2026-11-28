import { ConfigWidgets } from "@olula/componentes/index.js";
import { formatearFechaDate } from "@olula/lib/dominio.ts";
import { tCompras } from "#/compras/i18n/index.ts";
import { ArticuloDeLinea, ArticuloDeLineaConTipo, TipoArticuloLinea } from "./diseño.ts";

export const getTipoArticulo = (linea: ArticuloDeLinea): TipoArticuloLinea =>
    linea.referencia
        ? linea.descripcion === linea.descripcionArticulo
            ? "registrado"
            : "generico"
        : "libre";

export const articuloDeLineaValido = (linea: ArticuloDeLineaConTipo): boolean => {
    switch (linea.tipoArticulo) {
        case "registrado":
            return !!linea.referencia;
        case "generico":
            return !!linea.referencia && !!linea.descripcion;
        case "libre":
            return !!linea.descripcion;
    }
};

/** Documento de compra tal y como lo necesita la franja de datos clave. */
export type DocumentoCompraDatosClave = {
    fecha: Date;
    nombreProveedor?: string | null;
    idFiscal?: string | null;
    grupoIvaNegocioId?: string | null;
};

/**
 * Franja de datos clave del detalle de un documento de compra (pedido, albarán y
 * factura): Fecha · Proveedor · CIF/NIF · Grupo IVA negocio.
 *
 * Nombre y CIF/NIF son los del documento (también para proveedores no
 * registrados). El grupo de IVA se muestra con su descripción si
 * `descripcionGrupoIvaNegocio` la conoce (si no, con el código). A diferencia de
 * ventas, se muestra siempre: en compras el grupo llega también con
 * `iva_nav=legacy` (de la ficha del proveedor), igual que en la pestaña Datos.
 */
export const datosClaveDocumentoCompra = (
    documento: DocumentoCompraDatosClave,
    descripcionGrupoIvaNegocio: (id: string) => string | undefined = () => undefined,
) => {
    const grupo = documento.grupoIvaNegocioId ?? "";

    return [
        { etiqueta: tCompras("comun.datosClave.fecha"), valor: documento.fecha ? formatearFechaDate(new Date(documento.fecha)) : "—" },
        { etiqueta: tCompras("comun.datosClave.proveedor"), valor: documento.nombreProveedor?.trim() || "—" },
        { etiqueta: tCompras("comun.datosClave.cifNif"), valor: documento.idFiscal?.trim() || "—" },
        { etiqueta: tCompras("comun.datosClave.grupoIvaNegocio"), valor: (grupo && descripcionGrupoIvaNegocio(grupo)) || grupo || "—" },
    ];
};

/** Medidas de un documento de compra que se ofrecen al personalizar widgets. */
const camposWidgetsCompra = (t = tCompras): ConfigWidgets["campos"] => [
    { id: "total", etiqueta: t("comun.widgets.total"), formato: "moneda" },
    { id: "neto", etiqueta: t("comun.widgets.baseImponible"), formato: "moneda" },
    { id: "total_iva", etiqueta: t("comun.widgets.iva"), formato: "moneda" },
    { id: "total_irpf", etiqueta: t("comun.widgets.irpf"), formato: "moneda" },
    { id: "total_recargo", etiqueta: t("comun.widgets.recargo"), formato: "moneda" },
];

/** Widgets por defecto de un maestro de documentos de compra. */
export const widgetsDocumentoCompra = (
    recurso: string,
    textos: { plural: string; total: string; medio: string },
    t = tCompras
): ConfigWidgets => ({
    recurso,
    titulo: textos.plural,
    campos: camposWidgetsCompra(t),
    widgets: [
        { id: "documentos", titulo: textos.plural, operacion: "conteo", formato: "numero", pie: t("comun.widgets.recuento") },
        { id: "total", titulo: textos.total, operacion: "suma", campo: "total", formato: "moneda", pie: t("comun.widgets.sumaTotal") },
        { id: "neto", titulo: t("comun.widgets.baseImponible"), operacion: "suma", campo: "neto", formato: "moneda", pie: t("comun.widgets.sumaBase") },
        { id: "medio", titulo: textos.medio, operacion: "promedio", campo: "total", formato: "moneda", pie: t("comun.widgets.mediaTotal") },
    ],
});

/**
 * Al cambiar el artículo de una línea nueva, el servidor vuelve a calcular el coste y, si se
 * ha elegido un artículo, el impuesto: la línea toma el del artículo aunque llevase el I.V.A.
 * por defecto o el de otro artículo (como lineas*prov.qs al cambiar la referencia).
 */
export const reinicioAlCambiarArticulo = (cambios: { referencia?: string | null }) => ({
    ...(cambios.referencia !== undefined ? { pvpUnitario: null } : {}),
    ...(cambios.referencia ? { grupoIvaProductoId: null } : {}),
});
