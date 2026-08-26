import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { imprimir_blob } from "@olula/lib/impresion.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { useParams } from "react-router";
import { CambiarAgente } from "../../comun/componentes/moleculas/CambiarAgente/CambiarAgente.tsx";
import { CambiarDescuento } from "../../comun/componentes/moleculas/CambiarDescuento/CambiarDescuento.tsx";
import { CambiarDivisa } from "../../comun/componentes/moleculas/CambiarDivisa/CambiarDivisa.tsx";
import { TotalesVenta } from "../../venta/vistas/TotalesVenta.tsx";
import { BorrarFactura } from "../borrar/BorrarFactura.tsx";
import { Factura } from "../diseño.ts";
import { EmitirFactura } from "../emitir/EmitirFactura.tsx";
import { facturaEmitible } from "../dominio.ts";
import { EstadoExpedicion } from "../vistas/EstadoExpedicion.tsx";
import { IndicadorGuardado } from "../../comun/componentes/IndicadorGuardado.tsx";
import "../../comun/estilos/campos.css";
import "../../comun/estilos/detalle_documento.css";
import { tituloDocumentoVenta } from "../../venta/dominio.ts";
import { facturaVacia } from "../dominio.ts";
import { getReportFactura } from "../infraestructura.ts";
import "./DetalleFactura.css";
import { editable, metaFactura } from "./diseño.ts";
import { Lineas } from "./Lineas/Lineas.tsx";
import { getMaquina } from "./maquina.ts";
import { TabCliente } from "./TabCliente/TabCliente.tsx";
import { TabDatos } from "./TabDatos.tsx";
import { TabObservaciones } from "./TabObservaciones.tsx";
import { TabRecibos } from "./TabRecibos.tsx";

export const DetalleFactura = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const params = useParams();
  const facturaId = id ?? params.id;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      factura: facturaVacia(),
      facturaInicial: facturaVacia(),
      lineaActiva: null,
    },
    publicar
  );

  const autoGuardar = useCallback(
    async (modelo: Factura) => {
      await emitir("edicion_de_factura_lista", modelo);
    },
    [emitir]
  );

  const factura = useModelo(metaFactura, ctx.factura, autoGuardar);

  useEffect(() => {
    emitir("factura_id_cambiado", facturaId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facturaId]);

  const { estado, lineaActiva } = ctx;

  const titulo = (factura: Factura) => (
    <span className="titulo-documento">
      <EstadoExpedicion factura={factura} />
      {tituloDocumentoVenta(factura, "Nueva Factura")}
    </span>
  );

  const imprimir = useCallback(async () => {
    const blob = await getReportFactura(ctx.factura.id);
    imprimir_blob(blob);
  }, [ctx.factura.id]);

  if (!ctx.factura.id) return;

  const esEditable = editable(ctx.factura);

  const acciones = [
    {
      texto: "Emitir",
      onClick: () => emitir("emitir_solicitado"),
      deshabilitado: !facturaEmitible(ctx.factura),
    },
    {
      texto: "Imprimir",
      onClick: imprimir,
    },
    {
      icono: "eliminar",
      texto: "Borrar",
      advertencia: true,
      onClick: () => emitir("borrar_solicitado"),
      deshabilitado: !esEditable,
    },
  ];

  return (
    <Detalle
      id={ctx.factura.id}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={ctx.factura}
      cerrarDetalle={() => emitir("factura_deseleccionada", null)}
    >
      <div className="fila-acciones-documento">
        <IndicadorGuardado
          modificado={factura.modificado}
          error={factura.errorGuardado}
          guardados={factura.guardados}
        />
        <QuimeraAcciones acciones={acciones} vertical />
      </div>

      <Tabs>
        <Tab label="Cliente">
          <TabCliente factura={factura} estado={estado} publicar={emitir} />
        </Tab>

        <Tab label="Datos">
          <TabDatos factura={factura} estado={estado} publicar={emitir} />
        </Tab>

        <Tab label="Observaciones">
          <TabObservaciones factura={factura} />
        </Tab>

        <Tab label="Recibos">
          <TabRecibos facturaId={ctx.factura.id} />
        </Tab>
      </Tabs>

      <TotalesVenta modeloVenta={factura} publicar={emitir} />

      {estado === "CAMBIANDO_DESCUENTO" && (
        <CambiarDescuento publicar={emitir} venta={ctx.factura} />
      )}

      {estado === "CAMBIANDO_DIVISA" && (
        <CambiarDivisa
          publicar={emitir}
          divisaId={ctx.factura.divisa_id}
          tasaConversion={ctx.factura.tasa_conversion}
        />
      )}

      {estado === "CAMBIANDO_AGENTE" && (
        <CambiarAgente
          publicar={emitir}
          agenteId={ctx.factura.agente_id}
          nombreAgente={ctx.factura.nombre_agente}
          porComision={ctx.factura.por_comision}
        />
      )}

      <Lineas
        factura={ctx.factura}
        lineaActiva={lineaActiva}
        estadoFactura={estado}
        publicar={emitir}
      />

      {estado === "EMITIENDO_FACTURA" && (
        <EmitirFactura factura={ctx.factura} publicar={emitir} />
      )}

      {estado === "BORRANDO_FACTURA" && (
        <BorrarFactura factura={ctx.factura} publicar={emitir} />
      )}
    </Detalle>
  );
};
