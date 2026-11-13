import { ModalTraza } from "#/comun/componentes/traza/ModalTraza.tsx";
import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { bancaActiva } from "../../comun/banca.js";
import { EnlacePagoTarjeta } from "../../cobro_online/componentes/EnlacePagoTarjeta.tsx";
import { pasarelaPagoActiva } from "../../cobro_online/dominio.ts";
import { postEnlacePagoRecibo } from "../../cobro_online/infraestructura.ts";
import { ReciboVenta } from "../diseño.js";
import {
  reciboDesagrupable,
  reciboDevolvible,
  reciboPagable,
} from "../dominio.js";
import { getTrazaReciboVenta } from "../infraestructura.ts";
import { RecibosAgrupados } from "./agrupados/RecibosAgrupados.tsx";
import { DeshacerAgrupacion } from "./desagrupar/DeshacerAgrupacion.tsx";
import {
  contextoDetalleReciboVentaInicial,
  metaReciboVenta,
} from "./detalle.js";
import "./DetalleReciboVenta.css";
import { DevolverReciboVenta } from "./devolver/DevolverReciboVenta.tsx";
import { GenerarEnlaceCobroReciboVenta } from "./enlace_cobro/GenerarEnlaceCobroReciboVenta.tsx";
import { getMaquina } from "./maquina.js";
import { PagarReciboVenta } from "./pagar/PagarReciboVenta.tsx";
import { PagosReciboVenta } from "./pagos/PagosReciboVenta.tsx";

export const DetalleReciboVenta = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const { ctx, emitir } = useMaquina(
    getMaquina,
    contextoDetalleReciboVentaInicial,
    publicar
  );

  const { uiProps } = useModelo(metaReciboVenta, ctx.recibo);

  useEffect(() => {
    emitir("recibo_id_cambiado", id, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!ctx.recibo.id) return null;

  const titulo = (r: ReciboVenta) => r.codigo || `Recibo ${r.id}`;
  const bancaHabilitada = bancaActiva();
  const pasarelaHabilitada = pasarelaPagoActiva();

  const acciones = [
    reciboDevolvible(ctx.recibo)
      ? {
          texto: "Devolver",
          onClick: () => emitir("devolucion_solicitada"),
        }
      : {
          texto: "Pagar",
          onClick: () => emitir("pagar_solicitado"),
          deshabilitado: !reciboPagable(ctx.recibo),
        },
    pasarelaHabilitada && {
      texto: "Enlace de pago con tarjeta",
      onClick: () => emitir("enlace_tarjeta_solicitado"),
      deshabilitado: !reciboPagable(ctx.recibo),
    },
    bancaHabilitada && {
      texto: "Enviar enlace de cobro",
      onClick: () => emitir("enlace_cobro_solicitado"),
      deshabilitado: !reciboPagable(ctx.recibo),
    },
    {
      texto: "Deshacer agrupación",
      onClick: () => emitir("desagrupado_solicitado"),
      deshabilitado: !reciboDesagrupable(ctx.recibo),
      advertencia: true,
    },
    // Esta funcionalidad no existe en el ERP; posibilidad de habilitarla si se pide.
    // {
    //   texto: "Documentos relacionados",
    //   onClick: () => emitir("traza_solicitada"),
    // },
  ];

  return (
    <Detalle
      id={id}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={ctx.recibo}
      cerrarDetalle={() => emitir("recibo_deseleccionado", null, true)}
    >
      <div className="DetalleReciboVenta">
        <QuimeraAcciones acciones={acciones} vertical />

        <quimera-formulario>
          <QInput label="Código" {...uiProps("codigo")} />
          <QInput label="Estado" {...uiProps("estado")} />
          <QInput label="Importe" {...uiProps("importe")} />
          <QInput label="Fecha de emisión" {...uiProps("fechaEmision")} />
          <QInput
            label="Fecha de vencimiento"
            {...uiProps("fechaVencimiento")}
          />
          <Cliente {...uiProps("clienteId", "nombreCliente")} deshabilitado />
          <QInput label="ID Fiscal" {...uiProps("idFiscal")} />
          <QInput label="Factura" {...uiProps("facturaId")} />
        </quimera-formulario>

        {ctx.recibo.recibosAgrupados.length > 0 && (
          <RecibosAgrupados recibos={ctx.recibo.recibosAgrupados} />
        )}

        <PagosReciboVenta pagos={ctx.recibo.pagos} />

        {ctx.estado === "PAGANDO" && <PagarReciboVenta recibo={ctx.recibo} publicar={emitir} />}

        {ctx.estado === "ENLACE_COBRO" && (
          <GenerarEnlaceCobroReciboVenta recibo={ctx.recibo} publicar={emitir} />
        )}

        {ctx.estado === "ENLACE_TARJETA" && (
          <EnlacePagoTarjeta
            titulo={`Pago con tarjeta de ${ctx.recibo.nombreCliente || "el cliente"}`}
            descripcion={`el recibo ${ctx.recibo.codigo}`}
            generar={(email) => postEnlacePagoRecibo(ctx.recibo.id, email)}
            onCerrar={() => emitir("enlace_tarjeta_cerrado")}
          />
        )}

        {ctx.estado === "DEVOLVIENDO" && (
          <DevolverReciboVenta recibo={ctx.recibo} publicar={emitir} />
        )}

        {ctx.estado === "DESAGRUPANDO" && (
          <DeshacerAgrupacion recibo={ctx.recibo} publicar={emitir} />
        )}

        {ctx.estado === "VIENDO_TRAZA" && (
          <ModalTraza
            id={ctx.recibo.id}
            getTraza={getTrazaReciboVenta}
            onCerrar={() => emitir("traza_cerrada")}
          />
        )}
      </div>
    </Detalle>
  );
};
