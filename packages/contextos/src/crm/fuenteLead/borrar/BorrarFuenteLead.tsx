import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { FuenteLead } from "../diseño.ts";
import { deleteFuenteLead } from "../infraestructura.ts";
import { useTCrm } from "../../i18n/index.ts";

export const BorrarFuenteLead = ({
  publicar,
  fuente_lead,
}: {
  fuente_lead: FuenteLead;
  publicar: EmitirEvento;
}) => {
  const t = useTCrm();
  const borrar_ = useCallback(async () => {
    await deleteFuenteLead(fuente_lead.id);

    publicar("fuente_lead_borrada", fuente_lead.id);
  }, [publicar, fuente_lead.id]);

  const cancelar_ = useCallback(
    () => publicar("borrado_fuente_lead_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarFuenteLead"
      abierto={true}
      titulo={t("fuenteLead.confirmarBorrado")}
      mensaje={t("fuenteLead.estaSeguroDeQueDeseaBorrar")}
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};
