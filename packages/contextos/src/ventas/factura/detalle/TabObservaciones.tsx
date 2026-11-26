import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Factura } from "../diseño.ts";
import "./TabObservaciones.css";
import { useTVentas } from "../../i18n/index.ts";

interface TabClienteProps {
  factura: HookModelo<Factura>;
}

export const TabObservaciones = ({ factura }: TabClienteProps) => {
  const t = useTVentas();
  const { uiProps, modelo } = factura;

  return (
    <div className="TabObservaciones">
      <quimera-formulario>
        <QTextArea
          label={t("documento.detalle.pestanas.observaciones")}
          rows={5}
          {...uiProps("observaciones")}
        />
        <QCheckbox label={t("factura.detalle.automatica")} {...uiProps("automatica")} deshabilitado opcional={false} />
        <QCheckbox label={t("factura.detalle.servicios")} {...uiProps("servicios")} deshabilitado opcional={false} />
        <QCheckbox
          label={t("factura.detalle.rectificativa")}
          nombre="rectificativa"
          valor={!!modelo.rectificativa_id}
          deshabilitado
        />
      </quimera-formulario>
    </div>
  );
};
