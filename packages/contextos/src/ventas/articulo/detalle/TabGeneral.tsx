import { Familia } from "#/almacen/comun/componentes/Familia.tsx";
import { TipoCodBarras } from "#/comun/componentes/tipoCodBarras.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { FormModelo } from "@olula/lib/dominio.ts";
import "./TabGeneral.css";
import { useTVentas } from "../../i18n/index.ts";

export const TabGeneral = ({
  form,
  articuloId,
}: {
  form: FormModelo;
  articuloId: string;
}) => {
  const t = useTVentas();
  const { uiProps } = form;

  return (
    <div className="TabGeneral">
      <quimera-formulario>
        <QInput
          label={t("articulo.maestro.referencia")}
          nombre="id"
          valor={articuloId}
          soloLectura
        />
        <QInput
          label={t("articulo.detalle.descripcion")}
          {...uiProps("descripcion")}
        />
        <Familia {...uiProps("familiaId")} />
        <QInput
          label={t("articulo.detalle.codigoBarras")}
          {...uiProps("codbarras")}
        />
        <TipoCodBarras {...uiProps("tipoCodBarras")} />
        <QTextArea
          label={t("articulo.detalle.observaciones")}
          {...uiProps("observaciones")}
        />
      </quimera-formulario>
    </div>
  );
};
