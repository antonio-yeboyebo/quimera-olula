import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Contacto } from "../../diseño.ts";
import "./TabGeneral.css";
import { tCrm } from "../../../i18n/index.ts";

interface TabGeneralProps {
  contacto: HookModelo<Contacto>;
}

export const TabGeneral = ({ contacto }: TabGeneralProps) => {
  const { uiProps } = contacto;

  return (
    <div className="TabGeneral">
      <quimera-formulario>
        <QInput label={tCrm("contacto.nombre")} {...uiProps("nombre")} />
        <QInput label="NIF" {...uiProps("nif")} />
        <QInput label={tCrm("contacto.email")} {...uiProps("email")} />
        <QInput label={tCrm("contacto.telefono")} {...uiProps("telefono1")} />
      </quimera-formulario>
    </div>
  );
};
