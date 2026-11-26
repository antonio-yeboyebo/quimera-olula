import { useTVentas } from "../../../i18n/index.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useFocus } from "@olula/lib/useFocus.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { postCuentaBanco } from "../../infraestructura.ts";
import { metaNuevaCuentaBanco, nuevaCuentaBancoVacia } from "./dominio.ts";
import "./TabCuentasBanco.css";

interface CrearCuentaBancoProps {
  clienteId: string;
  emitir: (evento: string, payload?: unknown) => void;
}

export const CrearCuentaBanco = ({
  clienteId,
  emitir,
}: CrearCuentaBancoProps) => {
  const t = useTVentas();
  const { modelo, uiProps, valido } = useModelo(
    metaNuevaCuentaBanco,
    nuevaCuentaBancoVacia
  );
  const focus = useFocus();

  const guardar = async () => {
    const cuentaCreada = await postCuentaBanco(clienteId, modelo);
    emitir("cuenta_creada", cuentaCreada);
  };

  return (
    <div className="alta-cuenta-banco">
      <quimera-formulario>
        <QInput label={t("cliente.cuentas.descripcion")} {...uiProps("descripcion")} ref={focus} />
        <QInput label={t("cliente.cuentas.iban")} {...uiProps("iban")} />
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={guardar} deshabilitado={!valido}>
          {t("cliente.botones.guardar")}
        </QBoton>
        <QBoton
          tipo="reset"
          variante="texto"
          onClick={() => emitir("alta_cancelada")}
        >
          {t("cliente.botones.cancelar")}
        </QBoton>
      </div>
    </div>
  );
};
