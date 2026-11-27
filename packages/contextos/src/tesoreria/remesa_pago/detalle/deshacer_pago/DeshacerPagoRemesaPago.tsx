import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { RemesaPago } from "../../diseño.js";
import { esRemesaDeNominas } from "../../dominio.js";
import { useTTesoreria } from "../../../i18n/index.ts";

export const DeshacerPagoRemesaPago = ({
  remesa,
  publicar,
}: {
  remesa: RemesaPago;
  publicar: EmitirEvento;
}) => {
  const t = useTTesoreria();
  const deshacer_ = useCallback(
    async () => publicar("deshacer_pago_confirmado"),
    [publicar]
  );

  const cancelar_ = useCallback(
    () => publicar("deshacer_pago_cancelado"),
    [publicar]
  );

  const [deshacer, cancelar] = useForm(deshacer_, cancelar_);

  const que = esRemesaDeNominas(remesa) ? t("remesa_pago.susNominas") : t("remesa_pago.susRecibos");

  const mensaje = [
    t("remesa_pago.seEliminaraElPagoDeLa", { id: remesa.id }),
    "",
    t("remesa_pago.queVuelvenAQuedarRemesadosPendientes", { que }),
  ].join("\n");

  return (
    <QModalConfirmacion
      nombre="deshacer_pago_remesa_pago"
      abierto={true}
      titulo={t("remesa_pago.deshacerPago")}
      mensaje={mensaje}
      onCerrar={cancelar}
      onAceptar={deshacer}
      labelAceptar={t("remesa_pago.deshacer")}
    />
  );
};
