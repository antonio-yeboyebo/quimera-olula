import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { ModalTraza } from "#/comun/componentes/traza/ModalTraza.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { plugin } from "@olula/lib/dominio.ts";
import { imprimir_blob } from "@olula/lib/impresion.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { IndicadorGuardado } from "../../comun/componentes/IndicadorGuardado.tsx";
import { CambiarAgente } from "../../comun/componentes/moleculas/CambiarAgente/CambiarAgente.tsx";
import { CambiarDescuento } from "../../comun/componentes/moleculas/CambiarDescuento/CambiarDescuento.tsx";
import { CambiarDivisa } from "../../comun/componentes/moleculas/CambiarDivisa/CambiarDivisa.tsx";
import "../../comun/estilos/campos.css";
import "../../comun/estilos/detalle_documento.css";
import { tituloDocumentoVenta } from "../../venta/dominio.ts";
import { useDatosClaveDocumentoVenta } from "../../venta/vistas/useDatosClaveDocumentoVenta.ts";
import { TotalesVenta } from "../../venta/vistas/TotalesVenta.tsx";
import { AprobarPresupuesto } from "../aprobar/AprobarPresupuesto.tsx";
import { PedidoGenerado } from "../aprobar/PedidoGenerado.tsx";
import { BorrarPresupuesto } from "../borrar/BorrarPresupuesto.tsx";
import { Presupuesto } from "../diseño.ts";
import { aprobado, etiquetaEstadoPresupuesto } from "../dominio.ts";
import { getReportPresupuesto, getTrazaPresupuesto } from "../infraestructura.ts";
import { metaPresupuesto, presupuestoVacio } from "./detalle.ts";
import "./DetallePresupuesto.css";
import { Lineas } from "./lineas/Lineas.tsx";
import { getMaquina } from "./maquina.ts";
import { TabCliente } from "./TabCliente/TabCliente.tsx";
import { TabDatosBase as TabDatos } from "./TabDatosBase.tsx";
import { TabObservaciones } from "./TabObservaciones.tsx";
import { useTVentas } from "../../i18n/index.ts";

export const DetallePresupuesto = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const t = useTVentas();
  const params = useParams();
  const navigate = useNavigate();
  const presupuestoId = id ?? params.id;

  // Con presupuesto parcial se eligen las cantidades en una pantalla aparte;
  // sin él, aprobar sigue generando el pedido completo desde este detalle.
  const parcial = plugin("presupuesto_parcial") === "activo";
  // const parcial = true;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      presupuesto: presupuestoVacio(),
      presupuestoInicial: presupuestoVacio(),
      lineaActiva: null,
      pedidoCreado: null,
    },
    publicar
  );

  const autoGuardar = useCallback(
    async (modelo: Presupuesto) => {
      await emitir("edicion_de_presupuesto_lista", modelo);
    },
    [emitir]
  );

  const presupuesto = useModelo(metaPresupuesto, ctx.presupuesto, autoGuardar);
  const datosClave = useDatosClaveDocumentoVenta();

  useEffect(() => {
    emitir("presupuesto_id_cambiado", presupuestoId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presupuestoId]);

  const { estado, lineaActiva, pedidoCreado } = ctx;

  const titulo = (presupuesto: Presupuesto) =>
    tituloDocumentoVenta(presupuesto, t("presupuesto.maestro.nuevo"));

  const imprimir = useCallback(async () => {
    const blob = await getReportPresupuesto(ctx.presupuesto.id);
    imprimir_blob(blob);
  }, [ctx.presupuesto.id]);

  const acciones = useMemo(
    () => [
      {
        texto: t("presupuesto.detalle.aprobar"),
        onClick: parcial
          ? () => navigate(`/ventas/aprobar-presupuesto/${ctx.presupuesto.id}`)
          : () => emitir("aprobacion_solicitada", ctx.presupuesto),
        deshabilitado: aprobado(ctx.presupuesto),
      },
      {
        texto: t("documento.detalle.imprimir"),
        onClick: imprimir,
      },
      {
        texto: t("documento.detalle.documentosRelacionados"),
        onClick: () => emitir("traza_solicitada"),
      },
      {
        icono: "eliminar",
        texto: t("documento.detalle.borrar"),
        advertencia: true,
        onClick: () => emitir("borrar_solicitado"),
        deshabilitado: aprobado(ctx.presupuesto),
      },
    ],
    [parcial, navigate, emitir, imprimir, ctx.presupuesto, t]
  );

  if (!ctx.presupuesto.id) return;

  return (
    <Detalle
      id={ctx.presupuesto.id}
      obtenerTitulo={titulo}
      obtenerEstado={(presupuesto: Presupuesto) => (
        <EtiquetaEstado {...etiquetaEstadoPresupuesto(presupuesto)} />
      )}
      obtenerDatosClave={datosClave}
      setEntidad={() => {}}
      entidad={ctx.presupuesto}
      cerrarDetalle={() => emitir("presupuesto_deseleccionado", null)}
    >
      <div className="fila-acciones-documento">
        <IndicadorGuardado
          modificado={presupuesto.modificado}
          error={presupuesto.errorGuardado}
          guardados={presupuesto.guardados}
        />
        <QuimeraAcciones acciones={acciones} vertical />
      </div>

      <Tabs>
        <Tab label={t("documento.detalle.pestanas.lineas")}>
          <Lineas
            presupuesto={ctx.presupuesto}
            lineaActiva={lineaActiva}
            publicar={emitir}
            estadoPresupuesto={estado}
          />
        </Tab>

        <Tab label={t("documento.detalle.pestanas.cliente")}>
          <TabCliente
            presupuesto={presupuesto}
            estado={estado}
            publicar={emitir}
          />
        </Tab>

        <Tab label={t("documento.detalle.pestanas.datos")}>
          <TabDatos
            presupuesto={presupuesto}
            estado={estado}
            publicar={emitir}
          />
        </Tab>

        <Tab label={t("documento.detalle.pestanas.observaciones")}>
          <TabObservaciones presupuesto={presupuesto} />
        </Tab>
      </Tabs>

      <TotalesVenta modeloVenta={presupuesto} publicar={emitir} />

      {estado === "CAMBIANDO_DESCUENTO" && (
        <CambiarDescuento publicar={emitir} venta={ctx.presupuesto} />
      )}

      {estado === "CAMBIANDO_DIVISA" && (
        <CambiarDivisa
          publicar={emitir}
          divisaId={ctx.presupuesto.divisa_id}
          tasaConversion={ctx.presupuesto.tasa_conversion}
        />
      )}

      {estado === "CAMBIANDO_AGENTE" && (
        <CambiarAgente
          publicar={emitir}
          agenteId={ctx.presupuesto.agente_id}
          nombreAgente={ctx.presupuesto.nombre_agente}
          porComision={ctx.presupuesto.por_comision}
        />
      )}

      {estado === "BORRANDO_PRESUPUESTO" && (
        <BorrarPresupuesto presupuesto={ctx.presupuesto} publicar={emitir} />
      )}

      {estado === "APROBANDO_PRESUPUESTO" && (
        <AprobarPresupuesto publicar={emitir} />
      )}

      {estado === "PEDIDO_CREADO" && pedidoCreado && (
        <PedidoGenerado pedido={pedidoCreado} publicar={emitir} />
      )}

      {estado === "VIENDO_TRAZA" && (
        <ModalTraza
          id={ctx.presupuesto.id}
          getTraza={getTrazaPresupuesto}
          onCerrar={() => emitir("traza_cerrada")}
        />
      )}
    </Detalle>
  );
};
