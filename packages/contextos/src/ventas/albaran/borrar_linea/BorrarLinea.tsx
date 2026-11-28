import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useForm } from "@olula/lib/useForm.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useCallback } from "react";
import { LineaAlbaran } from "../diseño.ts";
import { deleteLinea } from "../infraestructura.ts";
import { useTVentas } from "../../i18n/index.ts";

export const BorrarLinea = ({
  publicar,
  linea,
  albaranId,
}: {
  publicar: ProcesarEvento;
  linea: LineaAlbaran;
  albaranId: string;
}) => {
  const t = useTVentas();
  const borrar_ = useCallback(async () => {
    await deleteLinea(albaranId, linea.id);
    publicar("linea_borrada", linea.id);
  }, [albaranId, linea, publicar]);

  const cancelar_ = useCallback(
    () => publicar("borrar_linea_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarLinea"
      abierto={true}
      titulo={t("documento.borrarLinea.titulo")}
      mensaje={t("documento.borrarLinea.mensaje")}
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};
