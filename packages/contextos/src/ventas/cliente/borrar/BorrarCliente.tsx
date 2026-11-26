import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { useTVentas } from "../../i18n/index.ts";
import { deleteCliente } from "../infraestructura.ts";

interface BorrarClienteProps {
  clienteId: string;
  clienteNombre: string;
  publicar?: ProcesarEvento;
  onCancelar?: () => void;
}

export const BorrarCliente = ({
  clienteId,
  clienteNombre,
  publicar = async () => {},
  onCancelar = () => {},
}: BorrarClienteProps) => {
  const t = useTVentas();
  const borrar_ = useCallback(async () => {
    await deleteCliente(clienteId);
    publicar("borrado_de_cliente_listo", { clienteId });
    onCancelar();
  }, [clienteId, publicar, onCancelar]);

  const cancelar_ = useCallback(() => onCancelar(), [onCancelar]);

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="borrarCliente"
      abierto={true}
      titulo={t("cliente.borrar.titulo")}
      mensaje={t("cliente.borrar.mensaje", { nombre: clienteNombre })}
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};
