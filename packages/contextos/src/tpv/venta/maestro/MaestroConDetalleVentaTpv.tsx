import { ColumnaEstadoTabla } from "#/comun/componentes/ColumnaEstadoTabla.tsx";
import { AgenteTpvActual } from "#/tpv/agente/agente_actual/AgenteTpvActual.tsx";
import { PuntoVentaTpvActual } from "#/tpv/punto_de_venta/punto_actual/PuntoVentaTpvActual.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QIcono } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import {
  criteriaDefecto,
  formatearFechaDate,
} from "@olula/lib/dominio.js";
import { FactoryObj } from "@olula/lib/factory_ctx.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useLayout } from "@olula/lib/useLayout.js";
import { useCallback, useEffect, useMemo } from "react";
import { CrearVentaTpv as CrearVentaTpvBase } from "../crear/CrearVentaTpv.tsx";
import { DetalleVentaTpv } from "../detalle/DetalleVentaTpv.tsx";
import { VentaTpv } from "../diseño.ts";
import { metaTablaFactura } from "./maestro.ts";
import { TotalPendienteVentaTpv } from "./TotalPendienteVentaTpv.tsx";
import "./MaestroConDetalleVentaTpv.css";
import { getMaquina } from "./maquina.ts";

export const MaestroConDetalleVentaTpv = () => {
  const criteriaBaseVentas = useMemo(() => {
    return {
      ...criteriaDefecto,
      orden: ["fecha", "DESC", "codigo", "DESC"],
    };
  }, []);

  const { layout, cambiarLayout } = useLayout("TARJETA");

  const { id, criteria } = getUrlParams();
  const criteriaInicial =
    criteria.filtro.length > 0 ? criteria : criteriaBaseVentas;

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    ventas: listaActivaEntidadesInicial<VentaTpv>(id, criteriaInicial),
  });

  useUrlParams(ctx.ventas.activo, ctx.ventas.criteria);

  const handle_punto_venta_cambiado = useCallback(() => {
    emitir("recarga_de_ventas_solicitada", ctx.ventas.criteria);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emitir]);

  useEffect(() => {
    emitir("recarga_de_ventas_solicitada", ctx.ventas.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Factura">
      <MaestroDetalle<VentaTpv>
        Maestro={
          <>
            <h2>Ventas TPV</h2>
            <div className="maestro-botones">
              <QBoton
                texto={
                  layout === "TARJETA" ? "Cambiar a TABLA" : "Cambiar a TARJETA"
                }
                onClick={cambiarLayout}
              />
            </div>
            <div className="tpv-puesto">
              <PuntoVentaTpvActual onChange={handle_punto_venta_cambiado} />
              <AgenteTpvActual />
            </div>
            <Listado<VentaTpv>
              metaTabla={metaTablaFactura}
              criteria={ctx.ventas.criteria}
              modo={layout === "TARJETA" ? "tarjetas" : "tabla"}
              tarjeta={TarjetaVentaTpv}
              entidades={ctx.ventas.lista}
              totalEntidades={ctx.ventas.total}
              seleccionada={ctx.ventas.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton onClick={() => emitir("crear_venta_solicitada")}>
                    Nueva Venta
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) => emitir("venta_seleccionada", payload)}
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
              onSiguientePagina={(payload) =>
                emitir("siguiente_pagina", payload)
              }
            />
          </>
        }
        Detalle={<DetalleVentaTpv id={ctx.ventas.activo} publicar={emitir} />}
        layout={layout}
        seleccionada={ctx.ventas.activo}
        modoDisposicion="maestro-50"
      />
      {ctx.estado === "CREANDO" && (() => {
        const CrearVenta_ = (FactoryObj.app.TPV?.venta_CrearVenta as typeof CrearVentaTpvBase) ?? CrearVentaTpvBase;
        return <CrearVenta_ publicar={emitir} />;
      })()}
    </div>
  );
};

const TarjetaVentaTpv = (venta: VentaTpv) => {
  return (
    <div className="tarjeta-venta" key={venta.id}>
      <div className="tarjeta-venta-izquierda">
        <ColumnaEstadoTabla
          estados={{
            abierta,
            cerrada,
          }}
          estadoActual={venta.abierta ? "abierta" : "cerrada"}
        />
        <div className="tarjeta-venta-izquierda-textos">
          <div>{`${venta.codigo} - ${formatearFechaDate(venta.fecha)}`}</div>
          {venta.cliente?.nombre !== "VENTA AL CONTADO" && (
            <div>{venta.cliente?.nombre}</div>
          )}
        </div>
      </div>
      <div className="tarjeta-venta-derecha">
        <TotalPendienteVentaTpv venta={venta} />
      </div>
    </div>
  );
};

const abierta = (
  <QIcono
    nombre={"circulo_relleno"}
    tamaño="sm"
    color="var(--color-exito-oscuro)"
  />
);

const cerrada = (
  <QIcono
    nombre={"circulo_relleno"}
    tamaño="sm"
    color="var(--color-deshabilitado-oscuro)"
  />
);
