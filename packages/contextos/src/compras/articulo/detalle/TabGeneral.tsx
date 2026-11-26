import { Familia } from "#/almacen/comun/componentes/Familia.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { FormModelo } from "@olula/lib/dominio.ts";
import "./TabGeneral.css";
import { useTCompras } from "#/compras/i18n/index.ts";

export const TabGeneral = ({
  form,
  articuloId,
}: {
  form: FormModelo;
  articuloId: string;
}) => {
  const t = useTCompras();
  const { uiProps } = form;

  return (
    <div className="TabGeneral">
      <quimera-formulario>
        <QInput label={t("comun.campos.referencia")} nombre="id" valor={articuloId} soloLectura />
        <QInput label={t("comun.campos.descripcion")} {...uiProps("descripcion")} />
        <Familia {...uiProps("familiaId")} />
        <QTextArea label={t("comun.campos.observaciones")} {...uiProps("observaciones")} />
      </quimera-formulario>
    </div>
  );
};
