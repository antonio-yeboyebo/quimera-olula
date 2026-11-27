import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Lead } from "../../diseño.ts";
import { tCrm } from "../../../i18n/index.ts";

export const TabObservaciones = ({ lead }: { lead: HookModelo<Lead> }) => {
  const { uiProps } = lead;

  return (
    <div className="TabObservaciones">
      <quimera-formulario>
        <QTextArea
          label={tCrm("lead.observaciones")}
          rows={5}
          {...uiProps("observaciones")}
        />
      </quimera-formulario>
    </div>
  );
};
