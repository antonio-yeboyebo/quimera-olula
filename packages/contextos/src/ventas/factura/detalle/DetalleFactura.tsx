import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { ModalTraza } from "#/comun/componentes/traza/ModalTraza.tsx";
import { AsientoDeDocumento } from "#/contabilidad/asiento/vistas/detalle/AsientoDeDocumento.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { imprimir_blob } from "@olula/lib/impresion.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect, useState } from "react";
import { CobrosOnline } from "#/tesoreria/cobro_online/componentes/CobrosOnline.tsx";
import { EnlacePagoTarjeta } from "#/tesoreria/cobro_online/componentes/EnlacePagoTarjeta.tsx";
import { pasarelaPagoActiva } from "#/tesoreria/cobro_online/dominio.ts";
import {
  getCobrosOnlineFactura,
  postEnlacePagoFactura,
} from "#/tesoreria/cobro_online/infraestructura.ts";
import { useParams } from "react-router";
import { CambiarAgente } from "../../comun/componentes/moleculas/CambiarAgente/CambiarAgente.tsx";
import { CambiarDescuento } from "../../comun/componentes/moleculas/CambiarDescuento/CambiarDescuento.tsx";
import { CambiarDivisa } from "../../comun/componentes/moleculas/CambiarDivisa/CambiarDivisa.tsx";
import { TotalesVenta } from "../../venta/vistas/TotalesVenta.tsx";
import { BorrarFactura } from "../borrar/BorrarFactura.tsx";
import { Factura } from "../diseño.ts";
import { EmitirFactura } from "../emitir/EmitirFactura.tsx";
import { etiquetaEstadoFactura, facturaEmitible } from "../dominio.ts";
import { IndicadorGuardado } from "../../comun/componentes/IndicadorGuardado.tsx";
import "../../comun/estilos/campos.css";
import "../../comun/estilos/detalle_documento.css";
import {
  datosClaveDocumentoVenta,
  tituloDocumentoVenta,
} from "../../venta/dominio.ts";
import { facturaVacia } from "../dominio.ts";
import { getReportFactura, getTrazaFactura } from "../infraestructura.ts";
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
  // Se incrementa al cerrar el enlace con tarjeta para releer sus cobros.
  const [recargaCobros, setRecargaCobros] = useState(0);

  useEffect(() => {
    emitir("factura_id_cambiado", facturaId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facturaId]);

  const { estado, lineaActiva } = ctx;

  const titulo = (factura: Factura) =>
    tituloDocumentoVenta(factura, "Nueva Factura");

  const estadoFactura = (factura: Factura) => (
    <EtiquetaEstado {...etiquetaEstadoFactura(factura)} />
  );

  const datosClave = datosClaveDocumentoVenta;

  const imprimir = useCallback(async () => {
    const blob = await getReportFactura(ctx.factura.id);
    imprimir_blob(blob);
  }, [ctx.factura.id]);

  if (!ctx.factura.id) return;

  const esEditable = editable(ctx.factura);
  const pasarelaHabilitada = pasarelaPagoActiva();
  // Solo una factura emitida tiene recibos que cobrar.
  const cobrableConTarjeta = ctx.factura.estadoExpedicion !== "BORRADOR";

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
    ...(pasarelaHabilitada
      ? [
          {
            texto: "Enlace de pago con tarjeta",
            onClick: () => emitir("enlace_tarjeta_solicitado"),
            deshabilitado: !cobrableConTarjeta,
          },
        ]
      : []),
    {
      texto: "Documentos relacionados",
      onClick: () => emitir("traza_solicitada"),
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
      obtenerEstado={estadoFactura}
      obtenerDatosClave={datosClave}
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
        <Tab label="Líneas">
          <Lineas
            factura={ctx.factura}
            lineaActiva={lineaActiva}
            estadoFactura={estado}
            publicar={emitir}
          />
        </Tab>

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
          {pasarelaHabilitada && (
            <CobrosOnline
              key={ctx.factura.id}
              getCobros={() => getCobrosOnlineFactura(ctx.factura.id)}
              recarga={recargaCobros}
            />
          )}
        </Tab>

        {puede("contabilidad.asiento") && (
          <Tab label="Contabilidad">
            <AsientoDeDocumento asientoId={ctx.factura.asiento_id ?? null} />
          </Tab>
        )}
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

      {estado === "EMITIENDO_FACTURA" && (
        <EmitirFactura factura={ctx.factura} publicar={emitir} />
      )}

      {estado === "BORRANDO_FACTURA" && (
        <BorrarFactura factura={ctx.factura} publicar={emitir} />
      )}

      {estado === "ENLACE_TARJETA" && (
        <EnlacePagoTarjeta
          titulo={`Pago con tarjeta de la factura ${ctx.factura.codigo}`}
          descripcion={`la factura ${ctx.factura.codigo}`}
          generar={(email) => postEnlacePagoFactura(ctx.factura.id, email)}
          onCerrar={() => {
            setRecargaCobros((n) => n + 1);
            emitir("enlace_tarjeta_cerrado");
          }}
        />
      )}

      {estado === "VIENDO_TRAZA" && (
        <ModalTraza
          id={ctx.factura.id}
          getTraza={getTrazaFactura}
          onCerrar={() => emitir("traza_cerrada")}
        />
      )}
    </Detalle>
  );
};
