import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { MotivoTarea } from "../diseño.ts";
import { deleteMotivoTarea } from "../infraestructura.ts";

export const BorrarMotivoTarea = ({
  publicar,
  motivoTarea,
}: {
  publicar: EmitirEvento;
  motivoTarea: MotivoTarea;
}) => {
  const borrar_ = useCallback(async () => {
    await deleteMotivoTarea(motivoTarea.id);
    publicar("motivo_tarea_borrado", motivoTarea.id);
  }, [motivoTarea.id, publicar]);

  const cancelar_ = useCallback(
    () => publicar("borrado_motivo_tarea_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarMotivoTarea"
      abierto={true}
      titulo="Confirmar borrado"
      mensaje="¿Está seguro de que desea borrar este motivo de tarea?"
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};
