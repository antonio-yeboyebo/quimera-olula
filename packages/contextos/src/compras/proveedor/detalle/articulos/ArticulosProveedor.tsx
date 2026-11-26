import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { Listado } from "@olula/componentes/maestro/Listado.tsx";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.ts";
import { ArticuloProveedor } from "../../../articulo_proveedor/diseño.ts";
import { useMemo } from "react";
import { tCompras, useTCompras } from "#/compras/i18n/index.ts";

const metaTablaArticulos = (t = tCompras): MetaTabla<ArticuloProveedor> => [
  {
    id: "por_defecto",
    cabecera: "",
    ancho: "2.5rem",
    render: (p) =>
      p.porDefecto ? (
        <QIcono
          nombre="estrella"
          tamaño="sm"
          color="var(--color-exito)"
          relleno="var(--color-exito)"
        />
      ) : (
        ""
      ),
  },
  { id: "articulo_id", cabecera: t("comun.campos.referencia"), render: (p) => p.articuloId },
  { id: "articulo", cabecera: t("comun.campos.articulo"), ancho: "20rem" },
  {
    id: "ref_proveedor",
    cabecera: t("proveedor.articulos.refProveedor"),
    render: (p) => p.refProveedor,
  },
  {
    id: "coste",
    cabecera: t("proveedor.articulos.coste"),
    tipo: "moneda",
    divisa: (p) => p.divisaId,
  },
  { id: "dto", cabecera: t("proveedor.articulos.dto"), tipo: "numero" },
];

const metaFiltroArticulos = (t = tCompras): MetaFiltro => ({
  articulo_id: {
    id: "articulo_id",
    label: t("comun.campos.referencia"),
    filtro: (v) => (v ? ["articulo_id", "~", v as string] : null),
  },
  articulo: {
    id: "articulo",
    label: t("comun.campos.articulo"),
    filtro: (v) => (v ? ["articulo", "~", v as string] : null),
  },
});

export const ArticulosProveedor = ({
  articulos,
  publicar,
}: {
  articulos: ListaActivaEntidades<ArticuloProveedor>;
  publicar: EmitirEvento;
}) => {
  const t = useTCompras();
  const metaTabla = useMemo(() => metaTablaArticulos(t), [t]);
  const metaFiltro = useMemo(() => metaFiltroArticulos(t), [t]);
  return (
  <Listado<ArticuloProveedor>
    metaTabla={metaTabla}
    metaFiltro={metaFiltro}
    criteria={articulos.criteria}
    modo="tabla"
    entidades={articulos.lista}
    totalEntidades={articulos.total}
    seleccionada={articulos.activo}
    onSeleccion={(payload) => publicar("articulo_proveedor_seleccionado", payload)}
    onCriteriaChanged={(payload) =>
      publicar("criteria_de_articulos_prov_cambiado", payload)
    }
    onSiguientePagina={(payload) =>
      publicar("siguiente_pagina_de_articulos_prov", payload)
    }
  />
  );
};
