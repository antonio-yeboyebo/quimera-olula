import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Albaran } from "../diseño.ts";
import { borrarAlbaran } from "../infraestructura.ts";
import { useTVentas } from "../../i18n/index.ts";

export const BorrarAlbaran = ({
  publicar,
  albaran,
}: {
  publicar: (evento: string, payload?: unknown) => void;
  albaran: Albaran;
}) => {
  const t = useTVentas();
  const borrar_ = useCallback(async () => {
    if (albaran.id) {
      await borrarAlbaran(albaran.id);
    }
    publicar("borrado_de_albaran_listo");
  }, [albaran.id, publicar]);

  const cancelar_ = useCallback(
    () => publicar("borrar_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarAlbaran"
      abierto={true}
      titulo={t("documento.detalle.confirmarBorrar")}
      mensaje={t("albaran.borrar.mensaje")}
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};
