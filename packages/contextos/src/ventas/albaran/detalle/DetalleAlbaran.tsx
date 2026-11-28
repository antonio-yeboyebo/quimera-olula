import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { ModalTraza } from "#/comun/componentes/traza/ModalTraza.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { imprimir_blob } from "@olula/lib/impresion.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { useParams } from "react-router";
import { IndicadorGuardado } from "../../comun/componentes/IndicadorGuardado.tsx";
import { CambiarAgente } from "../../comun/componentes/moleculas/CambiarAgente/CambiarAgente.tsx";
import { CambiarDescuento } from "../../comun/componentes/moleculas/CambiarDescuento/CambiarDescuento.tsx";
import { CambiarDivisa } from "../../comun/componentes/moleculas/CambiarDivisa/CambiarDivisa.tsx";
import "../../comun/estilos/campos.css";
import "../../comun/estilos/detalle_documento.css";
import { TotalesVenta } from "../../venta/vistas/TotalesVenta.tsx";
import { BorrarAlbaran } from "../borrar/BorrarAlbaran.tsx";
import { Albaran } from "../diseño.ts";
import { useDatosClaveDocumentoVenta } from "../../venta/vistas/useDatosClaveDocumentoVenta.ts";
import {
  albaranVacio,
  editable,
  etiquetaEstadoAlbaran,
  metaAlbaran,
  tituloAlbaran,
} from "../dominio.ts";
import { FacturaGenerada } from "../facturar/FacturaGenerada.tsx";
import { FacturarAlbaran } from "../facturar/FacturarAlbaran.tsx";
import { getReportAlbaran, getTrazaAlbaran } from "../infraestructura.ts";
import "./DetalleAlbaran.css";
import { Lineas } from "./lineas/Lineas.tsx";
import { getMaquina } from "./maquina.ts";
import { TabCliente } from "./TabCliente/TabCliente.tsx";
import { TabDatos } from "./TabDatos.tsx";
import { TabObservaciones } from "./TabObservaciones.tsx";
import { useTVentas } from "../../i18n/index.ts";

export const DetalleAlbaran = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const t = useTVentas();
  const params = useParams();
  const albaranId = id ?? params.id;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      albaran: albaranVacio(),
      albaranInicial: albaranVacio(),
      lineaActiva: null,
      facturaCreada: null,
    },
    publicar
  );

  const autoGuardar = useCallback(
    async (modelo: Albaran) => {
      await emitir("edicion_de_albaran_lista", modelo);
    },
    [emitir]
  );

  const albaran = useModelo(metaAlbaran, ctx.albaran, autoGuardar);
  const datosClave = useDatosClaveDocumentoVenta();

  useEffect(() => {
    emitir("albaran_id_cambiado", albaranId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albaranId]);

  const { estado, lineaActiva, facturaCreada } = ctx;

  const titulo = (albaran: Albaran) => tituloAlbaran(albaran);

  if (!ctx.albaran.id) return;

  const esEditable = editable(ctx.albaran);

  const imprimir = async () => {
    const blob = await getReportAlbaran(ctx.albaran.id);
    imprimir_blob(blob);
  };

  const acciones = [
    {
      texto: t("albaran.detalle.facturar"),
      onClick: () => emitir("facturar_solicitado"),
      deshabilitado: !esEditable,
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
      deshabilitado: !esEditable,
    },
  ];

  return (
    <Detalle
      id={ctx.albaran.id}
      obtenerTitulo={titulo}
      obtenerEstado={(albaran: Albaran) => (
        <EtiquetaEstado {...etiquetaEstadoAlbaran(albaran)} />
      )}
      obtenerDatosClave={datosClave}
      setEntidad={() => {}}
      entidad={ctx.albaran}
      cerrarDetalle={() => emitir("albaran_deseleccionado", null)}
    >
      <div className="fila-acciones-documento">
        <IndicadorGuardado
          modificado={albaran.modificado}
          error={albaran.errorGuardado}
          guardados={albaran.guardados}
        />
        <QuimeraAcciones acciones={acciones} vertical />
      </div>

      <Tabs>
        <Tab label={t("documento.detalle.pestanas.lineas")}>
          <Lineas
            albaran={ctx.albaran}
            lineaActiva={lineaActiva}
            publicar={emitir}
            estadoAlbaran={estado}
          />
        </Tab>

        <Tab label={t("documento.detalle.pestanas.cliente")}>
          <TabCliente albaran={albaran} estado={estado} publicar={emitir} />
        </Tab>

        <Tab label={t("documento.detalle.pestanas.datos")}>
          <TabDatos albaran={albaran} estado={estado} publicar={emitir} />
        </Tab>

        <Tab label={t("documento.detalle.pestanas.observaciones")}>
          <TabObservaciones albaran={albaran} />
        </Tab>
      </Tabs>

      <TotalesVenta modeloVenta={albaran} publicar={emitir} />

      {estado === "CAMBIANDO_DESCUENTO" && (
        <CambiarDescuento publicar={emitir} venta={ctx.albaran} />
      )}

      {estado === "CAMBIANDO_DIVISA" && (
        <CambiarDivisa
          publicar={emitir}
          divisaId={ctx.albaran.divisa_id}
          tasaConversion={ctx.albaran.tasa_conversion}
        />
      )}

      {estado === "CAMBIANDO_AGENTE" && (
        <CambiarAgente
          publicar={emitir}
          agenteId={ctx.albaran.agente_id}
          nombreAgente={ctx.albaran.nombre_agente}
          porComision={ctx.albaran.por_comision}
        />
      )}

      {estado === "BORRANDO_ALBARAN" && (
        <BorrarAlbaran albaran={ctx.albaran} publicar={emitir} />
      )}

      {estado === "FACTURANDO_ALBARAN" && (
        <FacturarAlbaran albaran={ctx.albaran} publicar={emitir} />
      )}

      {estado === "FACTURA_CREADA" && facturaCreada && (
        <FacturaGenerada factura={facturaCreada} publicar={emitir} />
      )}

      {estado === "VIENDO_TRAZA" && (
        <ModalTraza
          id={ctx.albaran.id}
          getTraza={getTrazaAlbaran}
          onCerrar={() => emitir("traza_cerrada")}
        />
      )}
    </Detalle>
  );
};
