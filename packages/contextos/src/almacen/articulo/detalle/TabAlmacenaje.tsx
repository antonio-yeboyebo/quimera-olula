import { ClaseAlmacenamiento } from "#/almacen/comun/componentes/ClaseAlmacenamiento.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.ts";
import { ListaPickingFijoArticulo } from "./ListaPickingFijoArticulo.tsx";
import "./TabAlmacenaje.css";
import { tAlmacen } from "../../i18n/index.ts";

export const TabAlmacenaje = ({ form, articuloId }: { form: FormModelo; articuloId: string }) => {
  const { uiProps } = form;

  return (
    <div className="TabAlmacenaje">
      <quimera-formulario>
        <ClaseAlmacenamiento {...uiProps("claseAlmacenamientoId")} />
        <QInput label={tAlmacen("articulo.largoM")} {...uiProps("largo")} />
        <QInput label={tAlmacen("articulo.anchoM")} {...uiProps("ancho")} />
        <QInput label={tAlmacen("articulo.altoM")} {...uiProps("alto")} />
      </quimera-formulario>
      <ListaPickingFijoArticulo articuloId={articuloId} />
    </div>
  );
};
