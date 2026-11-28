import { TipoIdFiscal } from "#/comun/componentes/tipoIdFiscal.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { useTVentas } from "../../i18n/index.ts";
import { Cliente } from "../diseño.ts";
import "./TabGeneral.css";

interface TabGeneralProps {
  form: HookModelo<Cliente>;
  cliente: Cliente;
  emitirCliente: EmitirEvento;
  recargarCliente: () => void;
}

export const TabGeneral = ({
  form,
  cliente,
  emitirCliente,
}: TabGeneralProps) => {
  const t = useTVentas();
  const { uiProps } = form;

  return (
    <div className="TabGeneral">
      <quimera-formulario>
        <QInput label={t("cliente.campos.nombre")} {...uiProps("nombre")} />
        <QInput label={t("cliente.campos.nombreComercial")} {...uiProps("nombre_comercial")} />
        <TipoIdFiscal {...uiProps("tipo_id_fiscal")} />
        <QInput label={t("cliente.campos.idFiscal")} {...uiProps("id_fiscal")} />
        <div className="TabGeneral-accion">
          <QBoton onClick={() => emitirCliente("cambio_id_fiscal_solicitado")}>
            {t("cliente.detalle.cambiarIdFiscal")}
          </QBoton>
        </div>
        <QInput label={t("cliente.campos.telefono1")} {...uiProps("telefono1")} />
        <QInput label={t("cliente.campos.telefono2")} {...uiProps("telefono2")} />
        <QInput label={t("cliente.campos.email")} {...uiProps("email")} />
        <QInput label={t("cliente.campos.web")} {...uiProps("web")} />
        {cliente.de_baja && (
          <QDate label={t("cliente.campos.fechaBaja")} {...uiProps("fecha_baja")} />
        )}
        <QTextArea label={t("cliente.campos.observaciones")} {...uiProps("observaciones")} />
      </quimera-formulario>
    </div>
  );
};
