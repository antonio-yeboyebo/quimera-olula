import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { DirCliente } from "../diseño.ts";
import { useTVentas } from "../../i18n/index.ts";
import { deleteDireccion } from "../infraestructura.ts";

interface BorrarDireccionProps {
  direccion: DirCliente;
  clienteId: string;
  publicar?: ProcesarEvento;
  onCancelar?: () => void;
}

export const BorrarDireccion = ({
  direccion,
  clienteId,
  publicar = async () => {},
  onCancelar = () => {},
}: BorrarDireccionProps) => {
  const t = useTVentas();
  const borrar_ = useCallback(async () => {
    await deleteDireccion(clienteId, direccion.id);
    publicar("borrado_confirmado", { direccion });
    onCancelar();
  }, [clienteId, direccion, publicar, onCancelar]);

  const cancelar_ = useCallback(() => onCancelar(), [onCancelar]);

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="borrarDireccion"
      abierto={true}
      titulo={t("cliente.direccion.borrarTitulo")}
      mensaje={t("cliente.direccion.borrarMensaje", { nombre: direccion.nombre_via })}
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};
