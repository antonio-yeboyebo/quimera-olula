import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Lead } from "../diseño.ts";
import { deleteLead } from "../infraestructura.ts";
import { useTCrm } from "../../i18n/index.ts";

export const BorrarLead = ({
  publicar,
  lead,
}: {
  lead: Lead;
  publicar: EmitirEvento;
}) => {
  const t = useTCrm();
  const borrar_ = useCallback(async () => {
    await deleteLead(lead.id);

    publicar("lead_borrado", lead.id);
  }, [publicar, lead.id]);

  const cancelar_ = useCallback(
    () => publicar("borrado_lead_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="borrarlead"
      abierto={true}
      titulo={t("lead.borrarLead")}
      mensaje={t("lead.estaSeguroDeQueDeseaBorrar")}
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};
