import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { ModalTraza } from "#/comun/componentes/traza/ModalTraza.tsx";
import { IndicadorGuardado } from "#/ventas/comun/componentes/IndicadorGuardado.tsx";
import { CambiarAgente } from "#/ventas/comun/componentes/moleculas/CambiarAgente/CambiarAgente.tsx";
import { CambiarDescuento } from "#/ventas/comun/componentes/moleculas/CambiarDescuento/CambiarDescuento.tsx";
import { CambiarDivisa } from "#/ventas/comun/componentes/moleculas/CambiarDivisa/CambiarDivisa.tsx";
import "#/ventas/comun/estilos/campos.css";
import "#/ventas/comun/estilos/detalle_documento.css";
import {
  datosClaveDocumentoVenta,
  tituloDocumentoVenta,
} from "#/ventas/venta/dominio.ts";
import { etiquetaEstadoPedido } from "../maestro/maestro.ts";
import { TotalesVenta } from "#/ventas/venta/vistas/TotalesVenta.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { FactoryCtx } from "@olula/lib/factory_ctx.js";
import { imprimir_blob } from "@olula/lib/impresion.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { BorrarPedido } from "../borrar/BorrarPedido.tsx";
import { Pedido } from "../diseño.ts";
import { pedidoPendiente } from "../dominio.ts";
import { getReportPedido, getTrazaPedido } from "../infraestructura.ts";
import { editable, metaPedido, pedidoVacio } from "./detalle.ts";
import "./DetallePedido.css";
import { AvisoPreparacionAlmacen } from "./aviso_almacen/AvisoPreparacionAlmacen.tsx";
import { Lineas } from "./lineas/Lineas.tsx";
import { getMaquina } from "./maquina.ts";
import { TabCliente } from "./TabCliente/TabCliente.tsx";
import { TabDatosBase as TabDatos } from "./TabDatos.tsx";
import { TabObservaciones } from "./TabObservaciones.tsx";

export type DetallePedidoProps = {
  id?: string;
  publicar: EmitirEvento;
};

export const DetallePedido = (props: DetallePedidoProps) => {
  const { app } = useContext(FactoryCtx);
  if (!app.Ventas) {
    return null;
  }
  const DetallePedido_ = app.Ventas
    .pedido_DetallePedido as typeof DetallePedidoBase;

  return <DetallePedido_ {...props} />;
};

export const DetallePedidoBase = ({
  id,
  publicar = async () => {},
}: DetallePedidoProps) => {
  const params = useParams();
  const navigate = useNavigate();
  const pedidoId = id ?? params.id;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      pedido: pedidoVacio(),
      pedidoInicial: pedidoVacio(),
      lineaActiva: null,
    },
    publicar
  );

  const autoGuardar = useCallback(
    async (modelo: Pedido) => {
      await emitir("edicion_de_pedido_lista", modelo);
    },
    [emitir]
  );

  const pedido = useModelo(metaPedido, ctx.pedido, autoGuardar);

  useEffect(() => {
    emitir("pedido_id_cambiado", pedidoId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId]);

  const { estado, lineaActiva } = ctx;

  const titulo = (pedido: Pedido) =>
    tituloDocumentoVenta(pedido, "Nuevo Pedido");

  const handleAlbaranar = useCallback(() => {
    const id = ctx.pedido.id ?? params.id;
    if (id) navigate(`/ventas/albaranar-pedido/${id}`);
  }, [navigate, ctx.pedido, params.id]);

  if (!ctx.pedido.id) return;

  const esEditable = editable(ctx.pedido);

  const imprimir = async () => {
    const blob = await getReportPedido(ctx.pedido.id);
    imprimir_blob(blob);
  };

  const acciones = [
    {
      texto: "Albaran parcial",
      onClick: handleAlbaranar,
      deshabilitado: !esEditable,
    },
    {
      texto: "Imprimir",
      onClick: imprimir,
    },
    {
      texto: "Documentos relacionados",
      onClick: () => emitir("traza_solicitada"),
    },
    {
      icono: "eliminar",
      texto: "Borrar",
      advertencia: true,
      onClick: () => emitir("borrar_solicitado"),
      deshabilitado: !pedidoPendiente(ctx.pedido),
    },
  ];

  return (
    <Detalle
      id={ctx.pedido.id}
      obtenerTitulo={titulo}
      obtenerEstado={(pedido: Pedido) => (
        <EtiquetaEstado {...etiquetaEstadoPedido(pedido)} />
      )}
      obtenerDatosClave={datosClaveDocumentoVenta}
      setEntidad={() => {}}
      entidad={ctx.pedido}
      cerrarDetalle={() => emitir("pedido_deseleccionado", null)}
    >
      <div className="fila-acciones-documento">
        <IndicadorGuardado
          modificado={pedido.modificado}
          error={pedido.errorGuardado}
          guardados={pedido.guardados}
        />
        <QuimeraAcciones acciones={acciones} vertical />
      </div>

      <AvisoPreparacionAlmacen pedido={ctx.pedido} />

      <Tabs>
        <Tab label="Líneas">
          <Lineas
            pedido={ctx.pedido}
            lineaActiva={lineaActiva}
            publicar={emitir}
            estadoPedido={estado}
          />
        </Tab>

        <Tab label="Cliente">
          <TabCliente pedido={pedido} estado={estado} publicar={emitir} />
        </Tab>

        <Tab label="Datos">
          <TabDatos pedido={pedido} estado={estado} publicar={emitir} />
        </Tab>

        <Tab label="Observaciones">
          <TabObservaciones pedido={pedido} />
        </Tab>
      </Tabs>

      <TotalesVenta modeloVenta={pedido} publicar={emitir} />

      {estado === "CAMBIANDO_DESCUENTO" && (
        <CambiarDescuento publicar={emitir} venta={ctx.pedido} />
      )}

      {estado === "CAMBIANDO_DIVISA" && (
        <CambiarDivisa
          publicar={emitir}
          divisaId={ctx.pedido.divisa_id}
          tasaConversion={ctx.pedido.tasa_conversion}
        />
      )}

      {estado === "CAMBIANDO_AGENTE" && (
        <CambiarAgente
          publicar={emitir}
          agenteId={ctx.pedido.agente_id}
          nombreAgente={ctx.pedido.nombre_agente}
          porComision={ctx.pedido.por_comision}
        />
      )}

      {estado === "BORRANDO_PEDIDO" && (
        <BorrarPedido pedido={ctx.pedido} publicar={emitir} />
      )}

      {estado === "VIENDO_TRAZA" && (
        <ModalTraza
          id={ctx.pedido.id}
          getTraza={getTrazaPedido}
          onCerrar={() => emitir("traza_cerrada")}
        />
      )}
    </Detalle>
  );
};
