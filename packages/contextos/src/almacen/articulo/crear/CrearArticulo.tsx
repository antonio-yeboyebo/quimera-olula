import { conImpuestoDefecto } from "#/almacen/config/dominio.ts";
import { useAplicarImpuestoDefecto } from "#/almacen/config/useImpuestoDefecto.ts";
import { GrupoIvaProducto } from "#/ventas/comun/componentes/grupo_iva_producto.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext } from "react";
import { Articulo } from "../diseño.ts";
import { getArticulo, postArticulo } from "../infraestructura.ts";
import { metaNuevoArticulo, nuevoArticuloVacio } from "./dominio.ts";
import { useTAlmacen } from "../../i18n/index.ts";

interface CrearArticuloProps {
  publicar?: EmitirEvento;
  onCancelar?: () => void;
  activo?: boolean;
}

export const CrearArticulo = ({
  publicar = async () => {},
  onCancelar = () => {},
  activo = false,
}: CrearArticuloProps) => {
  const t = useTAlmacen();
  const nuevoArticulo = useModelo(metaNuevoArticulo, nuevoArticuloVacio);
  const impuestoDefecto = useAplicarImpuestoDefecto(
    nuevoArticulo,
    "grupoIvaProductoId",
    "articulo"
  );
  const { intentar } = useContext(ContextoError);

  const guardar = async () => {
    const id = await intentar(() =>
      postArticulo(nuevoArticulo.modelo as Articulo)
    );
    nuevoArticulo.init(
      conImpuestoDefecto(nuevoArticuloVacio, "grupoIvaProductoId", impuestoDefecto)
    );
    const articuloCreado = await getArticulo(id);
    publicar("articulo_creado", articuloCreado);
    onCancelar();
  };

  if (!activo) return null;

  return (
    <QModal
      abierto={activo}
      nombre="crear_articulo"
      titulo={t("articulo.nuevoArticulo")}
      onCerrar={onCancelar}
    >
      <>
        <quimera-formulario>
          <QInput label={t("articulo.referencia")} autoSeleccion={true} {...nuevoArticulo.uiProps("id")} />
          <QInput
            label={t("articulo.descripcion")}
            {...nuevoArticulo.uiProps("descripcion")}
          />
          <GrupoIvaProducto {...nuevoArticulo.uiProps("grupoIvaProductoId")} />
        </quimera-formulario>
        <div className="botones">
          <QBoton
            onClick={guardar}
            deshabilitado={nuevoArticulo.valido === false}
          >
            {t("articulo.guardar")}
          </QBoton>
          <QBoton variante="texto" onClick={onCancelar}>
            {t("articulo.cancelar")}
          </QBoton>
        </div>
      </>
    </QModal>
  );
};
