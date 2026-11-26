import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useContext } from "react";
import { deleteArticulo } from "../infraestructura.ts";
import { useTAlmacen } from "../../i18n/index.ts";

interface BorrarArticuloProps {
  articuloId: string;
  publicar?: ProcesarEvento;
  onCancelar?: () => void;
}

export const BorrarArticulo = ({
  articuloId,
  publicar = async () => {},
  onCancelar = () => {},
}: BorrarArticuloProps) => {
  const t = useTAlmacen();
  const { intentar } = useContext(ContextoError);

  const borrar = async () => {
    await intentar(() => deleteArticulo(articuloId));
    publicar("borrado_de_articulo_listo", { articuloId });
    onCancelar();
  };

  return (
    <QModalConfirmacion
      nombre="borrarArticulo"
      abierto={true}
      titulo={t("articulo.confirmarBorrado")}
      mensaje={t("articulo.estaSeguroDeQueDeseaBorrar")}
      onCerrar={onCancelar}
      onAceptar={borrar}
    />
  );
};
