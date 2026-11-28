import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useCallback, useContext, useState } from "react";
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
  const { intentar } = useContext(ContextoError);
  const [borrando, setBorrando] = useState(false);

  // Si el servidor no deja borrar (p. ej. el cliente tiene facturas: 409), se cierra la
  // confirmación y queda a la vista el modal de error con su mensaje.
  const borrar = useCallback(async () => {
    setBorrando(true);
    try {
      await intentar(() => deleteCliente(clienteId));
    } catch {
      onCancelar();
      return;
    }
    publicar("borrado_de_cliente_listo", { clienteId });
    onCancelar();
  }, [clienteId, intentar, publicar, onCancelar]);

  const cancelar = useCallback(() => {
    if (!borrando) onCancelar();
  }, [borrando, onCancelar]);

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
