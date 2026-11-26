import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useTVentas } from "../../i18n/index.ts";

export const AprobarPresupuesto = ({
  publicar,
}: {
  publicar: (evento: string, payload?: unknown) => void;
}) => {
  const t = useTVentas();
  const aprobar = async () => {
    publicar("aprobacion_lista");
  };

  return (
    <QModalConfirmacion
      nombre="confirmarAprobarPresupuesto"
      abierto={true}
      titulo={t("presupuesto.aprobar.titulo")}
      mensaje={t("presupuesto.aprobar.mensaje")}
      onCerrar={() => publicar("aprobacion_cancelada")}
      onAceptar={aprobar}
    />
  );
};
