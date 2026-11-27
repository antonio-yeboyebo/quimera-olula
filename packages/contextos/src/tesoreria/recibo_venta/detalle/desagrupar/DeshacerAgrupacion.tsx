import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { ReciboVenta } from "../../diseño.js";
import { useTTesoreria } from "../../../i18n/index.ts";

export const DeshacerAgrupacion = ({
  recibo,
  publicar,
}: {
  recibo: ReciboVenta;
  publicar: EmitirEvento;
}) => {
  const t = useTTesoreria();
  const deshacer_ = useCallback(
    async () => publicar("desagrupado_confirmado"),
    [publicar]
  );

  const cancelar_ = useCallback(
    () => publicar("desagrupado_cancelado"),
    [publicar]
  );

  const [deshacer, cancelar] = useForm(deshacer_, cancelar_);

  const mensaje = [
    t("recibo_venta.elReciboDeGrupoCodigoSe", { codigo: recibo.codigo }),
    "",
    t("recibo_venta.losRecibosQueAgrupabaVuelvenA"),
  ].join("\n");

  return (
    <QModalConfirmacion
      nombre="deshacer_agrupacion_recibo_venta"
      abierto={true}
      titulo={t("recibo_venta.deshacerAgrupacion")}
      mensaje={mensaje}
      onCerrar={cancelar}
      onAceptar={deshacer}
      labelAceptar={t("recibo_venta.deshacer")}
    />
  );
};
