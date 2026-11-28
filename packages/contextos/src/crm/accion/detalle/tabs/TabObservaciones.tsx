import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Accion } from "../../diseño.ts";
import { tCrm } from "../../../i18n/index.ts";

export const TabObservaciones = ({
  accion,
}: {
  accion: HookModelo<Accion>;
}) => {
  const { uiProps } = accion;

  return (
    <div className="TabObservaciones">
      <quimera-formulario>
        <QTextArea
          label={tCrm("accion.observaciones")}
          rows={5}
          {...uiProps("observaciones")}
        />
      </quimera-formulario>
    </div>
  );
};
