import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { tCompras } from "#/compras/i18n/index.ts";
import { Albaran } from "../diseño.ts";
import { etiquetaEstadoAlbaran } from "../dominio.ts";

/** Columnas del maestro en el idioma activo (se piden al pintar, con el `t` de useTCompras). */
export const metaTablaAlbaran = (t = tCompras): MetaTabla<Albaran> => [
  {
    id: "facturaId",
    cabecera: t("comun.campos.estado"),
    render: (albaran: Albaran) => (
      <EtiquetaEstado {...etiquetaEstadoAlbaran(albaran)} />
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
    divisa: (albaran) => albaran.divisaId,
  },
  { id: "numeroProveedor", cabecera: t("comun.campos.numeroProveedor"), prioridad: "media" },
  {
    id: "almacenId",
    cabecera: t("comun.campos.almacen"),
    prioridad: "baja",
    render: (albaran) => albaran.nombreAlmacen || albaran.almacenId || "",
  },
  { id: "idFiscal", cabecera: t("comun.campos.idFiscal"), prioridad: "baja" },
];
