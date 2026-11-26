import { widgetsPedido } from "#/ventas/pedido/dominio.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import {
  filtroFechas,
  MetaFiltro,
} from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ClausulaFiltro } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import {
  filtroAgente,
  filtroAlmacen,
  filtroCliente,
  filtroCodigo,
  filtroFechaDocumento,
} from "../../comun/filtros.tsx";
import { CrearPedido } from "../crear/CrearPedido.tsx";
import { DetallePedido } from "../detalle/DetallePedido.tsx";
import { Pedido } from "../diseño.ts";
import { AlbaranarPedidos } from "./AlbaranarPedidos.tsx";
import "./MaestroConDetallePedido.css";
import { TarjetaDocumentoVenta } from "#/ventas/comun/componentes/TarjetaDocumentoVenta.tsx";
import {
  agruparPorCliente,
  estadoServidoPedido,
  etiquetaEstadoPedido,
  todosPuedenAlbaranarse,
} from "./maestro.ts";
import { getMaquina } from "./maquina.ts";
import { getMetaTablaPedido } from "./metatabla_pedido.tsx";
import { ResultadoAlbaranado } from "./ResultadoAlbaranado.tsx";
import { tVentas, useTVentas } from "../../i18n/index.ts";

const SERVIDO_NO = "No";
const SERVIDO_PARCIAL = "Parcial";
const SERVIDO_SI = "Sí";

const filtroSinServir: ClausulaFiltro[] = [
  ["servido", "in", [SERVIDO_NO, SERVIDO_PARCIAL] as unknown as string],
];

const campoFiltroServido = (): MetaFiltro => ({
  servido: {
    id: "servido",
    label: tVentas("pedido.maestro.servido"),
    tipo: "multiseleccion",
    opciones: [
      { valor: SERVIDO_NO, descripcion: tVentas("pedido.estado.pendiente") },
      { valor: SERVIDO_PARCIAL, descripcion: tVentas("pedido.estado.parcial") },
      { valor: SERVIDO_SI, descripcion: tVentas("pedido.estado.servido") },
    ],
    filtro: (valor) => {
      const elegidos = (valor as string[]) ?? [];
      if (elegidos.length === 0 || elegidos.length === 3) return null;
      return ["servido", "in", elegidos as unknown as string];
    },
  },
});

export const MaestroConDetallePedido = () => {
  const t = useTVentas();
  // Se recalculan al cambiar de idioma (t cambia).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const widgets = useMemo(() => widgetsPedido(), [t]);
  const { id, criteria } = getUrlParams();
  const criteriaInicial =
    criteria.filtro.length === 0
      ? { ...criteriaDefecto, filtro: filtroSinServir }
      : criteria;

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    pedidos: listaActivaEntidadesInicial<Pedido>(id, criteriaInicial),
    seleccionados: [],
    albaranesCreados: [],
    fallidos: [],
  });

  useUrlParams(ctx.pedidos.activo, ctx.pedidos.criteria);

  useEffect(() => {
    emitir("recarga_de_pedidos_solicitada", ctx.pedidos.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metaTablaPedido = getMetaTablaPedido();
  const metaFiltroPedido: MetaFiltro = {
    codigo: filtroCodigo,
    cliente_id: filtroCliente,
    agente_id: filtroAgente,
    fecha: filtroFechaDocumento,
    fecha_salida: {
      id: "fecha_salida",
      label: t("pedido.maestro.fechaSalida"),
      tipo: "intervalo_fechas",
      filtro: (v) => filtroFechas("fecha_salida", v),
    },
    almacen_id: filtroAlmacen,
    ...campoFiltroServido(),
  };

  return (
    <div className="Pedido">
      <MaestroDetalle<Pedido>
        Maestro={
          <>
            <h2>{t("pedido.maestro.titulo")}</h2>
            <Listado<Pedido>
              metaTabla={metaTablaPedido}
              metaFiltro={metaFiltroPedido}
              widgets={widgets}
              tarjeta={(pedido) => (
                <TarjetaDocumentoVenta
                  codigo={pedido.codigo}
                  nombreCliente={pedido.cliente.nombre_cliente}
                  fecha={pedido.fecha}
                  total={pedido.total}
                  divisa={pedido.divisa_id}
                  tasaConversion={pedido.tasa_conversion}
                  totalDivisaEmpresa={pedido.total_divisa_empresa}
                  estado={estadoServidoPedido(pedido)}
                  etiquetaEstado={etiquetaEstadoPedido(pedido)}
                />
              )}
              criteria={ctx.pedidos.criteria}
              entidades={ctx.pedidos.lista}
              totalEntidades={ctx.pedidos.total}
              seleccionada={ctx.pedidos.activo}
              seleccionadas={ctx.seleccionados}
              onMultiSeleccion={(ids) => emitir("seleccionados_cambiados", ids)}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton onClick={() => emitir("crear_pedido_solicitado")}>
                    {t("pedido.maestro.nuevo")}
                  </QBoton>
                  {todosPuedenAlbaranarse(ctx.seleccionados, ctx.pedidos.lista) && (
                    <QBoton onClick={() => emitir("albaranado_multiple_solicitado")}>
                      Albaranar ({ctx.seleccionados.length})
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
        Detalle={<DetallePedido id={ctx.pedidos.activo} publicar={emitir} />}
        seleccionada={ctx.pedidos.activo}
      />

      <QModal
        nombre="altaPedido"
        abierto={ctx.estado === "CREANDO_PEDIDO"}
        titulo={t("pedido.maestro.nuevo")}
        onCerrar={() => emitir("creacion_pedido_cancelada")}
      >
        {ctx.estado === "CREANDO_PEDIDO" && <CrearPedido publicar={emitir} />}
      </QModal>

      {ctx.estado === "ALBARANANDO_PEDIDOS" && (
        <AlbaranarPedidos
          publicar={emitir}
          pedidos={ctx.seleccionados.length}
          grupos={agruparPorCliente(ctx.seleccionados, ctx.pedidos.lista)}
        />
      )}

      {ctx.estado === "ALBARANES_CREADOS" && (
        <ResultadoAlbaranado
          publicar={emitir}
          creados={ctx.albaranesCreados}
          fallidos={ctx.fallidos}
        />
      )}
    </div>
  );
};
