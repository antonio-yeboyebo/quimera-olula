import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useForm } from "@olula/lib/useForm.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useCallback } from "react";
import { OportunidadVenta } from "../diseño.ts";
import { deleteOportunidadVenta } from "../infraestructura.ts";
import { useTCrm } from "../../i18n/index.ts";

export const BorrarOportunidadVenta = ({
  publicar,
  oportunidad,
}: {
  oportunidad: OportunidadVenta;
  publicar: ProcesarEvento;
}) => {
  const t = useTCrm();
  const borrar_ = useCallback(async () => {
    await deleteOportunidadVenta(oportunidad.id);

    publicar("oportunidad_borrada", oportunidad.id);
  }, [publicar, oportunidad.id]);

  const cancelar_ = useCallback(
    () => publicar("borrado_oportunidad_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarOportunidadVenta"
      abierto={true}
      titulo={t("oportunidadventa.confirmarBorrado")}
      mensaje={t("oportunidadventa.estaSeguroDeQueDeseaBorrar")}
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};
