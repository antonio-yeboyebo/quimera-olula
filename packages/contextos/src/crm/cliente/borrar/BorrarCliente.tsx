import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useForm } from "@olula/lib/useForm.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useCallback } from "react";
import { Cliente } from "../diseño.ts";
import { deleteCliente } from "../infraestructura.ts";
import { useTCrm } from "../../i18n/index.ts";

export const BorrarCliente = ({
  publicar,
  cliente,
}: {
  cliente: Cliente;
  publicar: ProcesarEvento;
}) => {
  const t = useTCrm();
  const borrar_ = useCallback(async () => {
    await deleteCliente(cliente.id);

    publicar("cliente_borrado", cliente.id);
  }, [publicar, cliente.id]);

  const cancelar_ = useCallback(
    () => publicar("borrado_cliente_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="borrarCliente"
      abierto={true}
      titulo={t("cliente.borrarCliente")}
      mensaje={t("cliente.estaSeguroDeQueDeseaBorrar")}
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};
