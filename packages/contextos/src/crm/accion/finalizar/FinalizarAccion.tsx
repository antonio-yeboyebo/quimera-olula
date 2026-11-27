import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Accion } from "../diseño.ts";
import { finalizarAccion } from "../infraestructura.ts";
import { useTCrm } from "../../i18n/index.ts";

export const FinalizarAccion = ({
  publicar,
  accion,
}: {
  accion: Accion;
  publicar: EmitirEvento;
}) => {
  const t = useTCrm();
  const finalizar_ = useCallback(async () => {
    await finalizarAccion(accion.id);

    publicar("accion_finalizada", accion.id);
  }, [publicar, accion.id]);

  const cancelar_ = useCallback(
    () => publicar("finalizado_accion_cancelado"),
    [publicar]
  );

  const [finalizar, cancelar] = useForm(finalizar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarFinalizarAccion"
      abierto={true}
      titulo={t("accion.confirmarFinalizado")}
      mensaje={t("accion.estaSeguroDeQueDeseaFinalizar")}
      onCerrar={cancelar}
      onAceptar={finalizar}
    />
  );
};
