import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useTVentas } from "../../i18n/index.ts";

export const BorrarLinea = ({
  publicar,
  idLinea,
}: {
  publicar: ProcesarEvento;
  idLinea: string;
}) => {
  const t = useTVentas();
  return (
    <QModalConfirmacion
      nombre="confirmarBorrarLinea"
      abierto={true}
      titulo={t("documento.borrarLinea.titulo")}
      mensaje={t("documento.borrarLinea.mensaje")}
      onCerrar={() => publicar("borrar_linea_cancelado")}
      onAceptar={() => publicar("linea_borrada", idLinea)}
    />
  );
};
