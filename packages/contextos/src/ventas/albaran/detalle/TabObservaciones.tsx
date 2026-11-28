import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Albaran } from "../diseño.ts";
import "./TabObservaciones.css";
import { useTVentas } from "../../i18n/index.ts";

interface TabObservacionesProps {
  albaran: HookModelo<Albaran>;
}

export const TabObservaciones = ({ albaran }: TabObservacionesProps) => {
  const t = useTVentas();
  const { uiProps } = albaran;

  return (
    <div className="TabObservaciones">
      <quimera-formulario>
        <QCheckbox
          label={t("albaran.maestro.abono")}
          {...uiProps("de_abono")}
        />
        <QTextArea
          label={t("documento.detalle.pestanas.observaciones")}
          rows={5}
          {...uiProps("observaciones")}
        />
      </quimera-formulario>
    </div>
  );
};
