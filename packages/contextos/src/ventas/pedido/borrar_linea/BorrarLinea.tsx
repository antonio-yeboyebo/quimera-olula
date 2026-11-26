import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useForm } from "@olula/lib/useForm.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useCallback } from "react";
import { LineaPedido } from "../diseño.ts";
import { deleteLinea } from "../infraestructura.ts";
import {
  textoCambiosEnPreparacion,
  useOrdenesAlmacenDePedido,
} from "../detalle/aviso_almacen/ordenes_almacen.ts";
import { useTVentas } from "../../i18n/index.ts";

export const BorrarLinea = ({
  pedidoId,
  publicar,
  linea,
}: {
  pedidoId: string;
  publicar: ProcesarEvento;
  linea: LineaPedido;
}) => {
  const t = useTVentas();
  const borrar_ = useCallback(async () => {
    await deleteLinea(pedidoId, linea.id);
    publicar("linea_borrada", linea.id);
  }, [pedidoId, linea, publicar]);

  const cancelar_ = useCallback(
    () => publicar("borrar_linea_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);
  const ordenesAlmacen = useOrdenesAlmacenDePedido(pedidoId);
  const mensaje = ordenesAlmacen.length > 0
    ? t("pedido.almacen.borrarLineaEnPreparacion", {
        ordenes: ordenesAlmacen.map((o) => o.id).join(", "),
        cambios: textoCambiosEnPreparacion(),
      })
    : t("documento.borrarLinea.mensaje");

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarLinea"
      abierto={true}
      titulo={t("documento.borrarLinea.titulo")}
      mensaje={mensaje}
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};
