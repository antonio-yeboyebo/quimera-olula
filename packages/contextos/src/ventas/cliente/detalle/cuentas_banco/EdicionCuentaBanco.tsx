import { useTVentas } from "../../../i18n/index.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useFocus } from "@olula/lib/useFocus.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { CuentaBanco } from "../../diseño.ts";
import { patchCuentaBanco } from "../../infraestructura.ts";
import { metaCuentaBanco } from "./dominio.ts";
import "./TabCuentasBanco.css";

interface EdicionCuentaBancoProps {
  clienteId: string;
  cuenta: CuentaBanco;
  emitir: (evento: string, payload?: unknown) => void;
}

export const EdicionCuentaBanco = ({
  clienteId,
  cuenta,
  emitir,
}: EdicionCuentaBancoProps) => {
  const t = useTVentas();
  const { modelo, uiProps, valido } = useModelo(metaCuentaBanco, cuenta);
  const focus = useFocus();

  const guardar = async () => {
    const cuentaActualizada = await patchCuentaBanco(clienteId, modelo);
    emitir("cuenta_actualizada", cuentaActualizada);
  };

  return (
    <div className="EdicionCuentaBanco">
      <quimera-formulario>
        <QInput label={t("cliente.cuentas.descripcion")} {...uiProps("descripcion")} soloLectura />
        <QInput label={t("cliente.cuentas.iban")} {...uiProps("iban")} ref={focus} />
        <QInput label={t("cliente.cuentas.bic")} {...uiProps("bic")} soloLectura />
        <QInput label={t("cliente.cuentas.codigoCuenta")} {...uiProps("codigo_cuenta")} soloLectura />
        <QInput label={t("cliente.cuentas.pais")} {...uiProps("pais_id")} soloLectura />
        <QInput label={t("cliente.cuentas.entidad")} {...uiProps("entidad")} soloLectura />
        <QInput label={t("cliente.cuentas.agencia")} {...uiProps("agencia")} soloLectura />
        <QInput label={t("cliente.cuentas.digitoControl")} {...uiProps("digito_control")} soloLectura />
        <QInput label={t("cliente.cuentas.cuenta")} {...uiProps("cuenta")} soloLectura />
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={guardar} deshabilitado={!valido}>
          {t("cliente.botones.guardar")}
        </QBoton>
        <QBoton
          tipo="reset"
          variante="texto"
          onClick={() => emitir("edicion_cancelada")}
        >
          {t("cliente.botones.cancelar")}
        </QBoton>
      </div>
    </div>
  );
};
