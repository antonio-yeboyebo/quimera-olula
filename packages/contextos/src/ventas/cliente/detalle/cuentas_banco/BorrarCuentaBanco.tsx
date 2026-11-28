import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { CuentaBanco } from "../../diseño.ts";
import { deleteCuentaBanco } from "../../infraestructura.ts";
import { useTVentas } from "../../../i18n/index.ts";

interface BorrarCuentaBancoProps {
  clienteId: string;
  cuenta: CuentaBanco;
  abierto: boolean;
  emitir: (evento: string, payload?: unknown) => void;
}

export const BorrarCuentaBanco = ({
  clienteId,
  cuenta,
  abierto,
  emitir,
}: BorrarCuentaBancoProps) => {
  const t = useTVentas();
  const handleBorrar = async () => {
    await deleteCuentaBanco(clienteId, cuenta.id);
    emitir("cuenta_borrada", cuenta.id);
  };

  return (
    <QModalConfirmacion
      nombre="confirmarBorradoCuenta"
      abierto={abierto}
      titulo={t("cliente.cuentas.borrarTitulo")}
      mensaje={t("cliente.cuentas.borrarMensaje")}
      onCerrar={() => emitir("borrado_cancelado")}
      onAceptar={handleBorrar}
    />
  );
};
