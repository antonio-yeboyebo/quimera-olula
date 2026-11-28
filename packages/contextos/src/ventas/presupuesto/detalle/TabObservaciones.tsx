import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Presupuesto } from "../diseño.ts";
import "./TabObservaciones.css";
import { useTVentas } from "../../i18n/index.ts";

interface TabObservacionesProps {
  presupuesto: HookModelo<Presupuesto>;
}

export const TabObservaciones = ({ presupuesto }: TabObservacionesProps) => {
  const t = useTVentas();
  const { uiProps } = presupuesto;

  return (
    <div className="TabObservaciones">
      <quimera-formulario>
        <QTextArea
          label={t("documento.detalle.pestanas.observaciones")}
          rows={5}
          {...uiProps("observaciones")}
        />
      </quimera-formulario>
    </div>
  );
};
