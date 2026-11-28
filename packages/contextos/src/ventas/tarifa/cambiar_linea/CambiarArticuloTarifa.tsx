import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { ArticuloTarifa } from "../diseño.js";
import { descripcionArticuloTarifa, metaArticuloTarifa } from "../dominio.js";
import { patchArticuloTarifa } from "../infraestructura.js";
import "./CambiarArticuloTarifa.css";
import { useTVentas } from "../../i18n/index.ts";

/**
 * Modal de cambio de precio.
 *
 * Solo se edita el precio: cambiar el artículo equivale a otro registro, así
 * que la operación es quitar y volver a añadir.
 */
export const CambiarArticuloTarifa = ({
  articulo,
  publicar,
}: {
  articulo: ArticuloTarifa;
  publicar: EmitirEvento;
}) => {
  const t = useTVentas();
  const { modelo, uiProps, valido } = useModelo(metaArticuloTarifa, articulo);

  const cambiar_ = useCallback(async () => {
    await patchArticuloTarifa(articulo.id, modelo);
    publicar("articulo_cambiado", articulo);
  }, [modelo, publicar, articulo]);

  const cancelar_ = useCallback(
    () => publicar("cambio_de_articulo_cancelado"),
    [publicar]
  );

  const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

  const focus = useFocus();

  return (
    <QModal
      abierto={true}
      nombre="cambiar_articulo_tarifa"
      titulo={`Precio de ${descripcionArticuloTarifa(articulo)}`}
      onCerrar={cancelar}
    >
      <div className="CambiarArticuloTarifa">
        <quimera-formulario>
          <QInput
            label={t("tarifa.articulos.precio")}
            {...uiProps("precio")}
            ref={focus}
            tipo="moneda"
          />
        </quimera-formulario>
        <div className="botones maestro-botones">
          <QBoton onClick={cambiar} deshabilitado={!valido}>
            Cambiar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
