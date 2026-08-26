import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import {
  filtroAgente,
  filtroAlmacen,
  filtroCliente,
  filtroCodigo,
  filtroFechaDocumento,
} from "../../comun/filtros.tsx";
import { CrearFactura } from "../crear/CrearFactura.tsx";
import { DetalleFactura } from "../detalle/DetalleFactura.tsx";
import { Factura } from "../diseño.ts";
import { metaTablaFactura as metaTablaBase } from "../dominio.ts";
import { EstadoExpedicion } from "../vistas/EstadoExpedicion.tsx";
import "./MaestroConDetalleFactura.css";
import { getMaquina } from "./maquina.ts";

export const MaestroConDetalleFactura = () => {
  const { id, criteria } = getUrlParams();

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    facturas: listaActivaEntidadesInicial<Factura>(id, criteria),
  });

  useUrlParams(ctx.facturas.activo, ctx.facturas.criteria);

  useEffect(() => {
    emitir("recarga_de_facturas_solicitada", ctx.facturas.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metaTablaFactura = [
    {
      id: "estadoExpedicion",
      cabecera: "",
      render: (factura: Factura) => <EstadoExpedicion factura={factura} />,
    },
    ...metaTablaBase,
  ] as MetaTabla<Factura>;

  const metaFiltroFactura: MetaFiltro = {
    codigo: filtroCodigo,
    cliente_id: filtroCliente,
    agente_id: filtroAgente,
    fecha: filtroFechaDocumento,
    almacen_id: filtroAlmacen,
  };

  return (
    <div className="Factura">
      <MaestroDetalle<Factura>
        Maestro={
          <>
            <h2>Facturas</h2>
            <Listado<Factura>
              metaTabla={metaTablaFactura}
              metaFiltro={metaFiltroFactura}
              criteria={ctx.facturas.criteria}
              entidades={ctx.facturas.lista}
              totalEntidades={ctx.facturas.total}
              seleccionada={ctx.facturas.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton onClick={() => emitir("crear_factura_solicitado")}>
                    Nueva Factura
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) => emitir("factura_seleccionada", payload)}
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
              onSiguientePagina={(payload) =>
                emitir("siguiente_pagina", payload)
              }
            />
          </>
        }
        Detalle={<DetalleFactura id={ctx.facturas.activo} publicar={emitir} />}
        seleccionada={ctx.facturas.activo}
        // modoDisposicion="maestro-50"
      />

      {ctx.estado === "CREANDO_FACTURA" && (
        <CrearFactura
          publicar={emitir}
          activo={true}
          onCancelar={() => emitir("creacion_factura_cancelada")}
        />
      )}
    </div>
  );
};
