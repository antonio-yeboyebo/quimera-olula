import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext } from "react";
import { Almacen } from "../../diseño.ts";
import { deleteAlmacen } from "../../infraestructura.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

export const BorrarAlmacen = ({
  publicar,
  activo = false,
  almacen,
}: {
  publicar: (evento: string, payload?: unknown) => void;
  almacen: Almacen;
  activo: boolean;
}) => {
  const t = useTAlmacen();
  const { intentar } = useContext(ContextoError);

  const borrar = async () => {
    if (almacen.id) {
      await intentar(() => deleteAlmacen(almacen.id));
    }
    publicar("almacen_borrado");
  };

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarAlmacen"
      abierto={activo}
      titulo={t("almacen.confirmarBorrado")}
      mensaje={t("almacen.estaSeguroDeQueDeseaBorrar")}
      onCerrar={() => publicar("borrado_cancelado")}
      onAceptar={borrar}
    />
  );
};
