import { TipoIdFiscal } from "#/comun/componentes/tipoIdFiscal.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Cliente } from "../../diseño.ts";
import "./TabGeneral.css";
import { tCrm } from "../../../i18n/index.ts";

interface TabGeneralProps {
  cliente: HookModelo<Cliente>;
  emitir: EmitirEvento;
}

export const TabGeneral = ({ cliente, emitir }: TabGeneralProps) => {
  const { uiProps } = cliente;

  return (
    <div className="TabGeneral">
      <quimera-formulario>
        <QInput label={tCrm("cliente.nombre")} {...uiProps("nombre")} />
        <QInput label={tCrm("cliente.nombreComercial")} {...uiProps("nombre_comercial")} />
        <TipoIdFiscal {...uiProps("tipo_id_fiscal")} />
        <QInput label={tCrm("cliente.idFiscal")} {...uiProps("id_fiscal")} />
        <div className="TabGeneral-accion">
          <QBoton onClick={() => emitir("cambio_id_fiscal_solicitado")}>
            {tCrm("cliente.cambiarIdFiscal")}
          </QBoton>
        </div>
        <QInput label={tCrm("cliente.telefono1")} {...uiProps("telefono1")} />
        <QInput label={tCrm("cliente.telefono2")} {...uiProps("telefono2")} />
        <QInput label={tCrm("cliente.email")} {...uiProps("email")} />
        <QInput label={tCrm("cliente.web")} {...uiProps("web")} />
        <QTextArea label={tCrm("cliente.observaciones")} {...uiProps("observaciones")} />
      </quimera-formulario>
    </div>
  );
};
