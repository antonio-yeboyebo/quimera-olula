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
import { getCuentasBanco } from "#/ventas/cliente/infraestructura.ts";
import { AnularUltimoMovimientoRecibo } from "../../comun/componentes/AnularUltimoMovimientoRecibo.tsx";
import { CambiarRecibo } from "../../comun/componentes/CambiarRecibo.tsx";
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
import { useTTesoreria } from "../../i18n/index.ts";
import { textoEstado } from "../../comun/estados.ts";

export const DetalleReciboVenta = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const t = useTTesoreria();
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

  const titulo = (r: ReciboVenta) => r.codigo || t("recibo_venta.reciboId", { id: r.id });
  const ultimo = [...ctx.recibo.pagos]
    .sort((a, b) => (a.fecha?.getTime() ?? 0) - (b.fecha?.getTime() ?? 0) || Number(a.id) - Number(b.id))
    .at(-1);
  const estadoRecibo = ctx.recibo.estado.trim().toLowerCase();
  const bancaHabilitada = bancaActiva();
  const pasarelaHabilitada = pasarelaPagoActiva();

  const acciones = [
    reciboDevolvible(ctx.recibo)
      ? {
          texto: t("recibo_venta.devolver"),
          onClick: () => emitir("devolucion_solicitada"),
        }
      : {
          texto: t("recibo_venta.pagar"),
          onClick: () => emitir("pagar_solicitado"),
          deshabilitado: !reciboPagable(ctx.recibo),
        },
    pasarelaHabilitada && {
      texto: t("recibo_venta.enlaceDePagoConTarjeta"),
      onClick: () => emitir("enlace_tarjeta_solicitado"),
      deshabilitado: !reciboPagable(ctx.recibo),
    },
    bancaHabilitada && {
      texto: t("recibo_venta.enviarEnlaceDeCobro"),
      onClick: () => emitir("enlace_cobro_solicitado"),
      deshabilitado: !reciboPagable(ctx.recibo),
    },
    {
      texto: t("recibo_venta.editarRecibo"),
      onClick: () => emitir("cambio_recibo_solicitado"),
      deshabilitado: estadoRecibo === "agrupado",
    },
    {
      texto: t("recibo_venta.anularUltimoPagoODevolucion"),
      onClick: () => emitir("anulacion_pago_solicitada"),
      deshabilitado: !ultimo || estadoRecibo === "remesado" || estadoRecibo === "agrupado",
      advertencia: true,
    },
    {
      texto: t("recibo_venta.deshacerAgrupacion"),
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
          <QInput label={t("recibo_venta.codigo")} {...uiProps("codigo")} />
          <QInput label={t("recibo_venta.estado")} {...uiProps("estado")} valor={textoEstado(String(uiProps("estado").valor ?? ""))} />
          <QInput label={t("recibo_venta.importe")} {...uiProps("importe")} />
          <QInput label={t("recibo_venta.fechaDeEmision")} {...uiProps("fechaEmision")} />
          <QInput
            label={t("recibo_venta.fechaDeVencimiento")}
            {...uiProps("fechaVencimiento")}
          />
          <Cliente {...uiProps("clienteId", "nombreCliente")} deshabilitado />
          <QInput label={t("recibo_venta.idFiscal")} {...uiProps("idFiscal")} />
          <QInput label={t("recibo_venta.factura")} {...uiProps("facturaId")} />
          <QInput label={t("recibo_venta.cuentaDeDomiciliacion")} {...uiProps("nombreCuentaDomiciliacion")} />
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
            titulo={t("recibo_venta.pagoConTarjetaDeValor", { valor: ctx.recibo.nombreCliente || t("recibo_venta.elCliente") })}
            descripcion={t("recibo_venta.elReciboCodigo", { codigo: ctx.recibo.codigo })}
            generar={(email) => postEnlacePagoRecibo(ctx.recibo.id, email)}
            onCerrar={() => emitir("enlace_tarjeta_cerrado")}
          />
        )}

        {ctx.estado === "DEVOLVIENDO" && (
          <DevolverReciboVenta recibo={ctx.recibo} publicar={emitir} />
        )}

        {ctx.estado === "CAMBIANDO" && (
          <CambiarRecibo
            recibo={{
              ...ctx.recibo,
              importeEditable:
                estadoRecibo === "emitido" && !!ctx.recibo.facturaId && !ctx.recibo.grupoId,
            }}
            getCuentas={async () =>
              ctx.recibo.clienteId
                ? (await getCuentasBanco(ctx.recibo.clienteId)).map((c) => ({
                    valor: c.id,
                    descripcion: c.descripcion || c.iban || c.id,
                  }))
                : []
            }
            publicar={emitir}
          />
        )}

        {ctx.estado === "ANULANDO_PAGO" && ultimo && (
          <AnularUltimoMovimientoRecibo
            codigo={ctx.recibo.codigo}
            tipo={ultimo.tipo}
            fecha={ultimo.fecha}
            publicar={emitir}
          />
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
