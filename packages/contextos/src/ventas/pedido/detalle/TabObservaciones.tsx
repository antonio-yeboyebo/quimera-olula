import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Pedido } from "../diseño.ts";
import "./TabObservaciones.css";
import { useTVentas } from "../../i18n/index.ts";

interface TabClienteProps<T extends Pedido> {
  pedido: HookModelo<T>;
}

export const TabObservaciones = <T extends Pedido>({
  pedido,
}: TabClienteProps<T>) => {
  const t = useTVentas();
  const { uiProps } = pedido;

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
