import { ModalTraza } from "#/comun/componentes/traza/ModalTraza.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { bancaActiva } from "../../comun/banca.js";
import { ReciboCompra } from "../diseño.js";
import {
  reciboCompraAnulable,
  reciboCompraDevolvible,
  reciboCompraPagable,
  ultimoMovimiento,
} from "../dominio.js";
import { AnularUltimoMovimientoRecibo } from "../../comun/componentes/AnularUltimoMovimientoRecibo.tsx";
import { PagosReciboVenta } from "../../recibo_venta/detalle/pagos/PagosReciboVenta.tsx";
import { DevolverReciboCompra } from "./devolver/DevolverReciboCompra.tsx";
import { PagarReciboCompra } from "./pagar/PagarReciboCompra.tsx";
import { getCuentasBancoProveedor } from "#/compras/proveedor/infraestructura.ts";
import { CambiarRecibo } from "../../comun/componentes/CambiarRecibo.tsx";
import { getTrazaReciboCompra } from "../infraestructura.ts";
import {
  contextoDetalleReciboCompraInicial,
  metaReciboCompra,
} from "./detalle.js";
import "./DetalleReciboCompra.css";
import { OrdenarPagoReciboCompra } from "./ordenar_pago/OrdenarPagoReciboCompra.tsx";
import { getMaquina } from "./maquina.js";
import { useTTesoreria } from "../../i18n/index.ts";
import { textoEstado } from "../../comun/estados.ts";

export const DetalleReciboCompra = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const t = useTTesoreria();
  const { ctx, emitir } = useMaquina(
    getMaquina,
    contextoDetalleReciboCompraInicial,
    publicar
  );

  const { uiProps } = useModelo(metaReciboCompra, ctx.recibo);

  useEffect(() => {
    emitir("recibo_id_cambiado", id, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!ctx.recibo.id) return null;

  const titulo = (r: ReciboCompra) => r.codigo || t("recibo_compra.reciboId", { id: r.id });
  const bancaHabilitada = bancaActiva();

  const ultimo = ultimoMovimiento(ctx.recibo);

  const acciones = [
    // TES-02: pago y devolución manuales, como `pagosdevolprov` en el ERP.
    reciboCompraDevolvible(ctx.recibo)
      ? {
          texto: t("recibo_compra.devolver"),
          onClick: () => emitir("devolucion_solicitada"),
        }
      : {
          texto: t("recibo_compra.pagar"),
          onClick: () => emitir("pagar_solicitado"),
          deshabilitado: !reciboCompraPagable(ctx.recibo),
        },
    {
      texto: t("recibo_compra.editarRecibo"),
      onClick: () => emitir("cambio_recibo_solicitado"),
    },
    {
      texto: t("recibo_compra.anularUltimoPagoODevolucion"),
      onClick: () => emitir("anulacion_pago_solicitada"),
      deshabilitado: !reciboCompraAnulable(ctx.recibo),
      advertencia: true,
    },
    // "Documentos relacionados" no existe en el ERP; posibilidad de habilitarla si se pide:
    // {
    //   texto: "Documentos relacionados",
    //   onClick: () => emitir("traza_solicitada"),
    // },
    bancaHabilitada && {
      texto: t("recibo_compra.pagarAlProveedor"),
      onClick: () => emitir("ordenar_pago_solicitado"),
      deshabilitado: !reciboCompraPagable(ctx.recibo),
    },
  ];

  return (
    <Detalle
      id={id}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={ctx.recibo}
      cerrarDetalle={() => emitir("recibo_deseleccionado", null, true)}
    >
      <div className="DetalleReciboCompra">
        <QuimeraAcciones acciones={acciones} vertical />

        <quimera-formulario>
          <QInput label={t("recibo_compra.codigo")} {...uiProps("codigo")} />
          <QInput label={t("recibo_compra.estado")} {...uiProps("estado")} valor={textoEstado(String(uiProps("estado").valor ?? ""))} />
          <QInput label={t("recibo_compra.importe")} {...uiProps("importe")} />
          <QInput label={t("recibo_compra.fechaDeEmision")} {...uiProps("fechaEmision")} />
          <QInput label={t("recibo_compra.fechaDeVencimiento")} {...uiProps("fechaVencimiento")} />
          <QInput label={t("recibo_compra.proveedor")} {...uiProps("nombreProveedor")} />
          <QInput label={t("recibo_compra.idFiscal")} {...uiProps("idFiscal")} />
          <QInput label={t("recibo_compra.factura")} {...uiProps("facturaId")} />
          <QInput label={t("recibo_compra.cuentaDeDomiciliacion")} {...uiProps("nombreCuentaDomiciliacion")} />
        </quimera-formulario>

        <PagosReciboVenta pagos={ctx.recibo.pagos} />

        {ctx.estado === "PAGANDO" && (
          <PagarReciboCompra recibo={ctx.recibo} publicar={emitir} />
        )}

        {ctx.estado === "DEVOLVIENDO" && (
          <DevolverReciboCompra recibo={ctx.recibo} publicar={emitir} />
        )}

        {ctx.estado === "CAMBIANDO" && (
          <CambiarRecibo
            recibo={{
              ...ctx.recibo,
              importeEditable:
                ctx.recibo.estado.trim().toLowerCase() === "emitido" && !!ctx.recibo.facturaId,
            }}
            getCuentas={async () =>
              ctx.recibo.proveedorId
                ? (await getCuentasBancoProveedor(ctx.recibo.proveedorId)).map((c) => ({
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

        {ctx.estado === "ORDENANDO_PAGO" && (
          <OrdenarPagoReciboCompra recibo={ctx.recibo} publicar={emitir} />
        )}

        {ctx.estado === "VIENDO_TRAZA" && (
          <ModalTraza
            id={ctx.recibo.id}
            getTraza={getTrazaReciboCompra}
            onCerrar={() => emitir("traza_cerrada")}
          />
        )}
      </div>
    </Detalle>
  );
};
