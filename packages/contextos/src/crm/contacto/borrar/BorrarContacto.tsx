import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useForm } from "@olula/lib/useForm.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useCallback } from "react";
import { Contacto } from "../diseño.ts";
import { deleteContacto } from "../infraestructura.ts";
import { useTCrm } from "../../i18n/index.ts";

export const BorrarContacto = ({
  publicar,
  contacto,
}: {
  contacto: Contacto;
  publicar: ProcesarEvento;
}) => {
  const t = useTCrm();
  const borrar_ = useCallback(async () => {
    await deleteContacto(contacto.id);

    publicar("contacto_borrado", contacto.id);
  }, [publicar, contacto.id]);

  const cancelar_ = useCallback(
    () => publicar("borrado_contacto_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="borrarContacto"
      abierto={true}
      titulo={t("contacto.borrarContacto")}
      mensaje={t("contacto.estaSeguroDeQueDeseaBorrar")}
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};
