import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Presupuesto } from "../diseño.ts";
import { borrarPresupuesto } from "../infraestructura.ts";
import { useTVentas } from "../../i18n/index.ts";

export const BorrarPresupuesto = ({
  publicar,
  presupuesto,
}: {
  publicar: (evento: string, payload?: unknown) => void;
  presupuesto: Presupuesto;
}) => {
  const t = useTVentas();
  const borrar_ = useCallback(async () => {
    if (presupuesto.id) {
      await borrarPresupuesto(presupuesto.id);
    }
    publicar("borrado_de_presupuesto_listo");
  }, [presupuesto.id, publicar]);

  const cancelar_ = useCallback(
    () => publicar("borrar_presupuesto_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarPresupuesto"
      abierto={true}
      titulo={t("documento.detalle.confirmarBorrar")}
      mensaje={t("presupuesto.borrar.mensaje")}
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};
