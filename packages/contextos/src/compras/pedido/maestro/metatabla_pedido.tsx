import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { tCompras } from "#/compras/i18n/index.ts";
import { Pedido } from "../diseño.ts";
import { etiquetaEstadoPedido } from "../dominio.ts";

/** Columnas del maestro en el idioma activo (se piden al pintar, con el `t` de useTCompras). */
export const metaTablaPedido = (t = tCompras): MetaTabla<Pedido> => [
  {
    id: "recibido",
    cabecera: t("comun.campos.estado"),
    render: (pedido: Pedido) => (
      <EtiquetaEstado {...etiquetaEstadoPedido(pedido)} />
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
    divisa: (pedido) => pedido.divisaId,
  },
  { id: "numeroProveedor", cabecera: t("comun.campos.numeroProveedor"), prioridad: "media" },
  {
    id: "fechaEntrada",
    cabecera: t("comun.campos.fechaEntrada"),
    tipo: "fecha",
    prioridad: "baja",
  },
  {
    id: "almacenId",
    cabecera: t("comun.campos.almacen"),
    prioridad: "baja",
    render: (pedido) => pedido.nombreAlmacen || pedido.almacenId || "",
  },
  { id: "idFiscal", cabecera: t("comun.campos.idFiscal"), prioridad: "baja" },
];
