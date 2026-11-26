import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext } from "react";
import { TransferenciaStock } from "../diseño.ts";
import { eliminarTransferenciaStock } from "../infraestructura.ts";
import { useTAlmacen } from "../../i18n/index.ts";

export const BorrarTransferenciaStock = ({
  publicar,
  activo = false,
  transferencia,
}: {
  publicar: (evento: string, payload?: unknown) => void;
  transferencia: TransferenciaStock;
  activo: boolean;
}) => {
  const t = useTAlmacen();
  const { intentar } = useContext(ContextoError);

  const borrar = async () => {
    if (transferencia.id) {
      await intentar(() => eliminarTransferenciaStock(transferencia.id));
    }
    publicar("transferencia_borrada");
  };

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarTransferenciaStock"
      abierto={activo}
      titulo={t("transferencias.confirmarBorrado")}
      mensaje={t("transferencias.estaSeguroDeQueDeseaBorrar")}
      onCerrar={() => publicar("borrado_cancelado")}
      onAceptar={borrar}
    />
  );
};
