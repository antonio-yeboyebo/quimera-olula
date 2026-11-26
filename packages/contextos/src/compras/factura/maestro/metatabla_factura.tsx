import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { tCompras } from "#/compras/i18n/index.ts";
import { Factura } from "../diseño.ts";
import { etiquetaEstadoFactura } from "../dominio.ts";

/** Columnas del maestro en el idioma activo (se piden al pintar, con el `t` de useTCompras). */
export const metaTablaFactura = (t = tCompras): MetaTabla<Factura> => [
  {
    id: "editable",
    cabecera: t("comun.campos.estado"),
    render: (factura: Factura) => (
      <EtiquetaEstado {...etiquetaEstadoFactura(factura)} />
    ),
  },
  { id: "codigo", cabecera: t("comun.campos.codigo"), prioridad: "alta", estilo: "secundario" },
  { id: "nombreProveedor", cabecera: t("comun.campos.proveedor"), prioridad: "alta", estilo: "destacado" },
  { id: "fecha", cabecera: t("comun.campos.fecha"), tipo: "fecha", prioridad: "alta" },
  {
    id: "total",
    estilo: "destacado",
    cabecera: t("comun.campos.total"),
    tipo: "moneda",
    prioridad: "alta",
    divisa: (factura) => factura.divisaId,
  },
  { id: "numeroProveedor", cabecera: t("comun.documento.numeroFacturaProveedor"), prioridad: "media" },
  {
    id: "deAbono",
    cabecera: t("comun.documento.abono"),
    prioridad: "media",
    render: (factura) => (factura.deAbono ? t("comun.si") : ""),
  },
  {
    id: "codigoRectificativa",
    cabecera: t("comun.documento.rectificaA"),
    prioridad: "baja",
    render: (factura) => factura.codigoRectificativa ?? "",
  },
  { id: "idFiscal", cabecera: t("comun.campos.idFiscal"), prioridad: "baja" },
];
