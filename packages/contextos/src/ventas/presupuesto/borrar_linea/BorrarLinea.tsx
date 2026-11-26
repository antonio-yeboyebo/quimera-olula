import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { LineaPresupuesto } from "../diseño.ts";
import { deleteLinea } from "../infraestructura.ts";
import { useTVentas } from "../../i18n/index.ts";

export const BorrarLinea = ({
  presupuestoId,
  publicar,
  linea,
}: {
  presupuestoId: string;
  publicar: EmitirEvento;
  linea: LineaPresupuesto;
}) => {
  const t = useTVentas();
  const borrar_ = useCallback(async () => {
    await deleteLinea(presupuestoId, linea.id);
    publicar("linea_borrada", linea.id);
  }, [presupuestoId, linea, publicar]);

  const cancelar_ = useCallback(
    () => publicar("borrar_linea_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarLinea"
      abierto={true}
      titulo={t("documento.borrarLinea.titulo")}
      mensaje={t("documento.borrarLinea.mensaje")}
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};
