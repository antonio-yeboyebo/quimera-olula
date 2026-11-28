import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { EstadoOportunidad } from "../diseño.ts";
import { deleteEstadoOportunidad } from "../infraestructura.ts";
import { useTCrm } from "../../i18n/index.ts";

export const BorrarEstadoOportunidad = ({
  publicar,
  estado_oportunidad,
}: {
  estado_oportunidad: EstadoOportunidad;
  publicar: EmitirEvento;
}) => {
  const t = useTCrm();
  const borrar_ = useCallback(async () => {
    await deleteEstadoOportunidad(estado_oportunidad.id);

    publicar("estado_oportunidad_borrado", estado_oportunidad.id);
  }, [publicar, estado_oportunidad.id]);

  const cancelar_ = useCallback(
    () => publicar("borrado_estado_oportunidad_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarEstadoOportunidad"
      abierto={true}
      titulo={t("estadoOportunidadVenta.confirmarBorrado")}
      mensaje={t("estadoOportunidadVenta.estaSeguroDeQueDeseaBorrar")}
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};
