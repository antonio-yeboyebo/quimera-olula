import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { useTTesoreria } from "../../i18n/index.ts";

/**
 * TES-02/TES-06: confirma el borrado del último pago o devolución de un
 * recibo, que se lleva su asiento contable (Eneboo: borrar el último registro
 * de `pagosdevolcli`/`pagosdevolprov`).
 */
export const AnularUltimoMovimientoRecibo = ({
  codigo,
  tipo,
  fecha,
  publicar,
}: {
  codigo: string;
  tipo: string;
  fecha: Date | null;
  publicar: EmitirEvento;
}) => {
  const t = useTTesoreria();
  const anular_ = useCallback(
    async () => publicar("anulacion_pago_confirmada"),
    [publicar]
  );

  const cancelar_ = useCallback(
    () => publicar("anulacion_pago_cancelada"),
    [publicar]
  );

  const [anular, cancelar] = useForm(anular_, cancelar_);

  const mensaje = [
    t("comun.seBorraraValorDelValor2Del", { valor: tipo.toLowerCase().startsWith("devol") ? t("comun.laDevolucion") : t("comun.elPago"), valor2: fecha?.toLocaleDateString() ?? "", codigo }),
    "",
    t("comun.elReciboVuelveAlEstadoQue"),
  ].join("\n");

  return (
    <QModalConfirmacion
      nombre="anular_ultimo_movimiento_recibo"
      abierto={true}
      titulo={t("comun.anularUltimoPagoODevolucion")}
      mensaje={mensaje}
      onCerrar={cancelar}
      onAceptar={anular}
      labelAceptar={t("comun.anular")}
    />
  );
};
