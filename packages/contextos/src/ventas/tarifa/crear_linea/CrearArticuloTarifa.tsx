import { Articulo } from "#/ventas/comun/componentes/articulo.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { Tarifa } from "../diseño.js";
import {
  metaNuevoArticuloTarifa,
  nuevoArticuloTarifaVacio,
} from "../dominio.js";
import { postArticuloTarifa } from "../infraestructura.js";
import "./CrearArticuloTarifa.css";
import { useTVentas } from "../../i18n/index.ts";

/**
 * Modal de alta de un precio de artículo dentro de la tarifa.
 *
 * El servidor rechaza el alta si el artículo ya está en esta tarifa (el par
 * artículo/tarifa es único) o si el artículo no existe; el error sube por
 * useForm hasta el contexto de error.
 *
 * El modelo inicial SIEMPRE va memoizado: useModelo lo reinicia cuando cambia
 * su identidad, así que crearlo en línea entra en bucle al escribir.
 */
export const CrearArticuloTarifa = ({
  tarifa,
  publicar,
}: {
  tarifa: Tarifa;
  publicar: EmitirEvento;
}) => {
  const t = useTVentas();
  const inicial = useMemo(nuevoArticuloTarifaVacio, []);

  const { modelo, uiProps, valido } = useModelo(
    metaNuevoArticuloTarifa,
    inicial
  );

  const crear_ = useCallback(async () => {
    const id = await postArticuloTarifa(tarifa.id, modelo);
    publicar("articulo_creado", id);
  }, [modelo, publicar, tarifa.id]);

  const cancelar_ = useCallback(
    () => publicar("alta_de_articulo_cancelada"),
    [publicar]
  );

  const [crear, cancelar] = useForm(crear_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="crear_articulo_tarifa"
      titulo={`Añadir artículo a ${tarifa.nombre}`}
      onCerrar={cancelar}
    >
      <div className="CrearArticuloTarifa">
        <quimera-formulario>
          {/* El segundo argumento de uiProps guarda la descripción que
                        devuelve el autocompletar en el campo descripcionArticulo. */}
          <Articulo
            {...uiProps("articuloId", "descripcionArticulo")}
            autoFocus
          />
          <QInput
            label={t("tarifa.articulos.precio")}
            {...uiProps("precio")}
            divisa={tarifa.divisaId || "EUR"}
            tipo="moneda"
          />
        </quimera-formulario>
        <div className="botones maestro-botones">
          <QBoton onClick={crear} deshabilitado={!valido}>
            {t("tarifa.articulos.anadirBoton")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
