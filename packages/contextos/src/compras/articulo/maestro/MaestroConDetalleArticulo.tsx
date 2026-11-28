import { filtroFamilia } from "#/almacen/comun/filtros.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { ClausulaFiltro, Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.ts";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.ts";
import { useEffect, useMemo } from "react";
import { tCompras, useTCompras } from "#/compras/i18n/index.ts";
import { CrearArticulo } from "../crear/CrearArticulo.tsx";
import { DetalleArticulo } from "../detalle/DetalleArticulo.tsx";
import { Articulo } from "../diseño.ts";
import { getMaquina } from "./maquina.ts";
import { TarjetaArticulo } from "./TarjetaArticulo.tsx";

const metaTablaArticulo = (t = tCompras): MetaTabla<Articulo> => [
  { id: "id", cabecera: t("comun.campos.referencia") },
  { id: "descripcion", cabecera: t("comun.campos.descripcion") },
  {
    id: "descripcion_familia",
    cabecera: t("articulo.maestro.familia"),
    render: (a) => a.descripcionFamilia,
  },
];

const criteriaArticulosCompra = (): Criteria => ({
  ...criteriaDefecto,
  filtro: [
    ["se_compra", "=", "true"],
    ["sin_stock", "=", "false"],
  ] as ClausulaFiltro[],
  paginacion: { ...criteriaDefecto.paginacion },
});

const metaFiltroArticulo = (t = tCompras): MetaFiltro => ({
  id: {
    id: "id",
    label: t("comun.campos.referencia"),
    filtro: (v) => (v ? ["id", "~", v as string] : null),
  },
  descripcion: {
    id: "descripcion",
    label: t("comun.campos.descripcion"),
    filtro: (v) => (v ? ["descripcion", "~", v as string] : null),
  },
  familia_id: filtroFamilia,
  se_compra: {
    id: "se_compra",
    label: t("articulo.maestro.soloComprables"),
    tipo: "checkbox",
    filtro: (v) => (v === "true" ? ["se_compra", "=", "true"] : null),
    fromFiltro: (filtro) =>
      filtro.some(
        ([campo, , valor]) => campo === "se_compra" && valor === "true"
      )
        ? "true"
        : "",
  },
  sin_stock: {
    id: "sin_stock",
    label: t("articulo.maestro.sinStock"),
    tipo: "checkbox",
    filtro: (v) => (v === "true" ? ["sin_stock", "=", "false"] : null),
    fromFiltro: (filtro) =>
      filtro.some(
        ([campo, , valor]) => campo === "sin_stock" && valor === "false"
      )
        ? "true"
        : "",
  },
});

export const MaestroConDetalleArticulo = () => {
  const t = useTCompras();
  const metaTabla = useMemo(() => metaTablaArticulo(t), [t]);
  const metaFiltro = useMemo(() => metaFiltroArticulo(t), [t]);
  const criteriaBase = useMemo(criteriaArticulosCompra, []);

  const { id, criteria } = getUrlParams();
  const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    articulos: listaActivaEntidadesInicial<Articulo>(id, criteriaInicial),
  });

  const { articulos } = ctx;

  useUrlParams(articulos.activo, articulos.criteria);

  useEffect(() => {
    emitir("recarga_de_articulos_solicitada", articulos.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ComprasArticulo">
      <MaestroDetalle<Articulo>
        Maestro={
          <>
            <h2>{t("articulo.maestro.titulo")}</h2>
            <Listado<Articulo>
              metaTabla={metaTabla}
              metaFiltro={metaFiltro}
              tarjeta={TarjetaArticulo}
              criteria={articulos.criteria}
              modoInicial="tabla"
              entidades={articulos.lista}
              totalEntidades={articulos.total}
              seleccionada={articulos.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton onClick={() => emitir("crear_articulo_solicitado")}>
                    {t("articulo.maestro.nuevo")}
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) =>
                emitir("articulo_seleccionado", payload)
              }
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
              onSiguientePagina={(payload) =>
                emitir("siguiente_pagina", payload)
              }
            />
          </>
        }
        Detalle={<DetalleArticulo id={articulos.activo} publicar={emitir} />}
        seleccionada={articulos.activo}
        modoDisposicion="maestro-50"
      />
      {ctx.estado === "CREANDO" && <CrearArticulo publicar={emitir} />}
    </div>
  );
};
