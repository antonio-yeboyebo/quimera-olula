import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useContext } from "react";
import { LineaTransferenciaStock } from "../../diseño.ts";
import { eliminarLineaTransferenciaStock } from "../../infraestructura.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

export const BorrarLineaTransferenciaStock = ({
  publicar,
  activo = false,
  linea,
  transferenciaID,
}: {
  publicar: ProcesarEvento;
  linea: LineaTransferenciaStock;
  activo: boolean;
  transferenciaID: string;
}) => {
  const t = useTAlmacen();
  const { intentar } = useContext(ContextoError);

  const borrar = async () => {
    if (linea.id) {
      await intentar(() =>
        eliminarLineaTransferenciaStock(transferenciaID, linea.id)
      );
    }
    publicar("linea_transferencia_borrada");
  };

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarLineaTransferenciaStock"
      abierto={activo}
      titulo={t("transferencias.confirmarBorrado")}
      mensaje={t("transferencias.estaSeguroDeQueDeseaBorrar2")}
      onCerrar={() => publicar("borrado_cancelado")}
      onAceptar={borrar}
    />
  );
};
