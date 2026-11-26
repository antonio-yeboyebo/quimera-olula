import { widgetsDocumentoCompra } from "#/compras/comun/dominio.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { getMetaFiltroDefecto } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { camelASnake } from "@olula/componentes/maestro/maestroFiltros/dominio.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.ts";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.ts";
import { useEffect, useMemo } from "react";
import { useTCompras } from "#/compras/i18n/index.ts";
import { CrearPedido } from "../crear/CrearPedido.tsx";
import { DetallePedido } from "../detalle/DetallePedido.tsx";
import { Pedido } from "../diseño.ts";
import { AlbaranarPedidos } from "./AlbaranarPedidos.tsx";
import { agruparPorProveedor, puedenAlbaranarse } from "./maestro.ts";
import { ResultadoAlbaranado } from "./ResultadoAlbaranado.tsx";
import "./MaestroConDetallePedido.css";
import { getMaquina } from "./maquina.ts";
import { metaTablaPedido } from "./metatabla_pedido.tsx";
import { TarjetaPedido } from "./TarjetaPedido.tsx";


const criteriaPedidos = {
  ...criteriaDefecto,
  orden: ["fecha", "DESC"],
};

export const MaestroConDetallePedido = () => {
  const t = useTCompras();
  // Columnas, filtros y widgets en el idioma activo: se rehacen al cambiarlo.
  const metaTabla = useMemo(() => metaTablaPedido(t), [t]);
  // Filtros con el nombre de campo de la API (snake_case): el modelo va en camelCase.
  const metaFiltro = useMemo(() => getMetaFiltroDefecto(metaTabla, { campoApi: camelASnake }), [metaTabla]);
  const widgets = useMemo(
    () => widgetsDocumentoCompra("compras.pedido", {
      plural: t("pedido.maestro.titulo"),
      total: t("pedido.maestro.importeTotal"),
      medio: t("pedido.maestro.medio"),
    }, t),
    [t]
  );
  const criteriaBase = useMemo(() => criteriaPedidos, []);

  const { id, criteria } = getUrlParams();
  const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    pedidos: listaActivaEntidadesInicial<Pedido>(id, criteriaInicial),
    seleccionados: [],
    resultado: null,
  });

  const { estado, pedidos, seleccionados, resultado } = ctx;

  useUrlParams(pedidos.activo, pedidos.criteria);

  useEffect(() => {
    emitir("recarga_de_pedidos_solicitada", pedidos.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ComprasPedido">
      <MaestroDetalle<Pedido>
        Maestro={
          <>
            <h2>{t("pedido.maestro.titulo")}</h2>
            <Listado<Pedido>
              metaTabla={metaTabla}
              metaFiltro={metaFiltro}
              widgets={widgets}
              criteria={pedidos.criteria}
              tarjeta={TarjetaPedido}
              entidades={pedidos.lista}
              totalEntidades={pedidos.total}
              seleccionada={pedidos.activo}
              seleccionadas={seleccionados}
              onMultiSeleccion={(ids) => emitir("seleccionados_cambiados", ids)}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton onClick={() => emitir("crear_pedido_solicitado")}>
                    {t("pedido.maestro.nuevo")}
                  </QBoton>
                  {puedenAlbaranarse(seleccionados, pedidos.lista) && (
                    <QBoton onClick={() => emitir("albaranado_solicitado")}>
                      {t("pedido.maestro.albaranar", { cuantos: seleccionados.length })}
                    </QBoton>
                  )}
                </div>
              )}
              onSeleccion={(payload) => emitir("pedido_seleccionado", payload)}
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
              onSiguientePagina={(payload) =>
                emitir("siguiente_pagina", payload)
              }
            />
          </>
        }
        Detalle={<DetallePedido id={pedidos.activo} publicar={emitir} />}
        seleccionada={pedidos.activo}
        // modoDisposicion="maestro-50"
      />

      {estado === "CREANDO" && <CrearPedido publicar={emitir} />}

      {estado === "ALBARANANDO" && (
        <AlbaranarPedidos
          pedidos={seleccionados.length}
          grupos={agruparPorProveedor(seleccionados, pedidos.lista)}
          publicar={emitir}
        />
      )}

      {estado === "ALBARAN_CREADO" && resultado && (
        <ResultadoAlbaranado resultado={resultado} publicar={emitir} />
      )}
    </div>
  );
};
