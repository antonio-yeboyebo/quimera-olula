import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { ArticuloProveedor } from "../diseño.ts";
import { deleteArticuloProveedor } from "../infraestructura.ts";
import { useTCompras } from "#/compras/i18n/index.ts";

export const BorrarArticuloProveedor = ({
  precio,
  publicar,
}: {
  precio: ArticuloProveedor;
  publicar: EmitirEvento;
}) => {
  const t = useTCompras();
  const borrar_ = useCallback(async () => {
    await deleteArticuloProveedor(precio.id);
    publicar("precio_borrado", precio.id);
  }, [precio.id, publicar]);

  const cancelar_ = useCallback(
    () => publicar("borrado_de_precio_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarArticuloProveedor"
      abierto={true}
      titulo={t("articulo.precios.borrarTitulo")}
      mensaje={t("articulo.precios.borrarMensaje", { proveedor: precio.proveedor })}
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};
