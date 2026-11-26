import { GrupoIvaProducto } from "#/ventas/comun/componentes/grupo_iva_producto.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.ts";
import { Articulo } from "../diseño.ts";
import "./TabVentas.css";
import { useTVentas } from "../../i18n/index.ts";

export const TabVentas = ({
  form,
}: {
  form: FormModelo;
  articulo: Articulo;
}) => {
  const t = useTVentas();
  const { uiProps } = form;

  return (
    <div className="TabVentas">
      <quimera-formulario>
        <QInput label={t("articulo.detalle.precio")} {...uiProps("precio")} />
        <GrupoIvaProducto {...uiProps("grupoIvaProductoId")} />
        {/* <QCheckbox
          label={t("articulo.detalle.pvpVariable")}
          nombre="pvpVariable"
          valor={articulo.pvpVariable}
          soloLectura
        />
        <QCheckbox
          label={t("articulo.detalle.sinStock")}
          nombre="noStock"
          valor={articulo.noStock}
          soloLectura
        /> */}
      </quimera-formulario>
    </div>
  );
};
