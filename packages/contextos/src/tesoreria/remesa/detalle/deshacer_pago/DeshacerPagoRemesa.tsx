import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { Remesa } from "../../diseño.js";
import { useTTesoreria } from "../../../i18n/index.ts";

export const DeshacerPagoRemesa = ({
  remesa,
  publicar,
}: {
  remesa: Remesa;
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

  const mensaje = [
    t("remesa.seEliminaraElPagoDeLa", { id: remesa.id }),
    "",
    t("remesa.segunLaConfiguracionSusRecibosPueden"),
  ].join("\n");

  return (
    <QModalConfirmacion
      nombre="deshacer_pago_remesa"
      abierto={true}
      titulo={t("remesa.deshacerPago")}
      mensaje={mensaje}
      onCerrar={cancelar}
      onAceptar={deshacer}
      labelAceptar={t("remesa.deshacer")}
    />
  );
};
