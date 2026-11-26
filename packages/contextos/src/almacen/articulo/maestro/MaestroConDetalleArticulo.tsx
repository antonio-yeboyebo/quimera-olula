import { filtroFamilia } from "#/almacen/comun/filtros.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { ClausulaFiltro, Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { CrearArticulo } from "../crear/CrearArticulo.tsx";
import { DetalleArticulo } from "../detalle/DetalleArticulo.tsx";
import { Articulo } from "../diseño.ts";
import { UsoArticulo } from "../UsoArticulo.tsx";
import { ContextoMaestroArticulo } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { tAlmacen, useTAlmacen } from "../../i18n/index.ts";

const metaTablaArticulo: MetaTabla<Articulo> = [
  { id: "id", get cabecera() { return tAlmacen("articulo.referencia"); } },
  { id: "descripcion", get cabecera() { return tAlmacen("articulo.descripcion"); } },
  {
    id: "descripcion_familia",
    get cabecera() { return tAlmacen("articulo.familia"); },
    render: (a) => a.descripcionFamilia,
  },
  { id: "uso", get cabecera() { return tAlmacen("articulo.uso"); }, render: UsoArticulo },
];

const filtroBooleano =
  (campo: string) =>
  (valor: unknown): ClausulaFiltro | null =>
    valor === undefined || valor === null || valor === ""
      ? null
      : [campo, "=", String(valor)];

const metaFiltroArticulo: MetaFiltro = {
  id: {
    id: "id",
    get label() { return tAlmacen("articulo.referencia"); },
    filtro: (v) => (v ? ["id", "~", v as string] : null),
  },
  descripcion: {
    id: "descripcion",
    get label() { return tAlmacen("articulo.descripcion"); },
    filtro: (v) => (v ? ["descripcion", "~", v as string] : null),
  },
  familia_id: filtroFamilia,
  barcode: {
    id: "barcode",
    get label() { return tAlmacen("articulo.codBarras"); },
    filtro: (v) => (v ? ["barcode", "~", v as string] : null),
  },
  se_vende: {
    id: "se_vende",
    get label() { return tAlmacen("articulo.seVende"); },
    tipo: "checkbox",
    filtro: filtroBooleano("se_vende"),
  },
  se_compra: {
    id: "se_compra",
    get label() { return tAlmacen("articulo.seCompra"); },
    tipo: "checkbox",
    filtro: filtroBooleano("se_compra"),
  },
  sin_stock: {
    id: "sin_stock",
    get label() { return tAlmacen("articulo.noControlaStock"); },
    tipo: "checkbox",
    filtro: filtroBooleano("sin_stock"),
  },
};

const criteriaConStock = (): Criteria => ({
  ...criteriaDefecto,
  filtro: [["sin_stock", "=", "false"]] as ClausulaFiltro[],
  paginacion: { ...criteriaDefecto.paginacion },
});

export const MaestroConDetalleArticulo = () => {
  const t = useTAlmacen();
  const criteriaBase = useMemo(criteriaConStock, []);

  const { id, criteria } = getUrlParams();
  const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    articulos: listaActivaEntidadesInicial<Articulo>(id, criteriaInicial),
  } as ContextoMaestroArticulo);

  useUrlParams(ctx.articulos.activo, ctx.articulos.criteria);

  useEffect(() => {
    emitir("recarga_de_articulos_solicitada", ctx.articulos.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Articulo">
      <MaestroDetalle<Articulo>
        seleccionada={ctx.articulos.activo}
        Maestro={
          <>
            <h2>{t("articulo.articulos")}</h2>
            <Listado<Articulo>
              metaTabla={metaTablaArticulo}
              metaFiltro={metaFiltroArticulo}
              modo="tabla"
              criteria={ctx.articulos.criteria}
              entidades={ctx.articulos.lista}
              totalEntidades={ctx.articulos.total}
              seleccionada={ctx.articulos.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton onClick={() => emitir("creacion_solicitada")}>
                    {t("articulo.nuevoArticulo")}
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
        modoDisposicion="maestro-50"
        Detalle={
          <DetalleArticulo
            key={ctx.articulos.activo}
            id={ctx.articulos.activo}
            publicar={emitir}
          />
        }
      />
      <CrearArticulo
        publicar={emitir}
        onCancelar={() => emitir("creacion_cancelada")}
        activo={ctx.estado === "CREANDO_ARTICULO"}
      />
    </div>
  );
};
