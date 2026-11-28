import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Tarifa } from "../diseño.js";
import { deleteTarifa } from "../infraestructura.js";
import { useTVentas } from "../../i18n/index.ts";

/**
 * El servidor rechaza con 409 el borrado de una tarifa que tenga artículos
 * asociados. No se comprueba aquí: useForm deja subir el error y el contexto
 * de error muestra el mensaje del servidor, que es el único que sabe si la
 * tarifa sigue teniendo artículos en el momento del borrado.
 */
export const BorrarTarifa = ({
  publicar,
  tarifa,
}: {
  tarifa: Tarifa;
  publicar: EmitirEvento;
}) => {
  const t = useTVentas();
  const borrar_ = useCallback(async () => {
    await deleteTarifa(tarifa.id);
    publicar("tarifa_borrada", tarifa);
  }, [publicar, tarifa]);

  const cancelar_ = useCallback(
    () => publicar("borrado_de_tarifa_cancelado"),
    [publicar]
  );

  const [borrar, cancelar] = useForm(borrar_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="borrarTarifa"
      abierto={true}
      titulo={t("tarifa.borrar.titulo")}
      mensaje={t("tarifa.borrar.mensaje", { nombre: tarifa.nombre })}
      onCerrar={cancelar}
      onAceptar={borrar}
    />
  );
};
