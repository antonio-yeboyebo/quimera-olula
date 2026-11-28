import { useTVentas } from "../../../i18n/index.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { useFocus } from "@olula/lib/useFocus.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { metaNuevoCrmContacto, nuevoCrmContactoVacio } from "./dominio.ts";
import "./CrmContactos.css";

interface CrearCrmContactosProps {
  emitir: (evento: string, payload?: unknown) => void;
}

export const CrearCrmContactos = ({ emitir }: CrearCrmContactosProps) => {
  const t = useTVentas();
  const { modelo, uiProps, valido } = useModelo(
    metaNuevoCrmContacto,
    nuevoCrmContactoVacio
  );
  const focus = useFocus();

  const guardar = async () => {
    emitir("crear_contacto", modelo);
  };

  return (
    <div className="alta-crm-contactos">
      <quimera-formulario>
        <QInput label={t("cliente.agenda.nombre")} {...uiProps("nombre")} ref={focus} />
        <QInput label={t("cliente.agenda.cargo")} {...uiProps("cargo")} />
        <QInput label={t("cliente.agenda.email")} {...uiProps("email")} />
        <QInput label={t("cliente.agenda.telefono1")} {...uiProps("telefono1")} />
        <QInput label={t("cliente.agenda.telefono2")} {...uiProps("telefono2")} />
        <QTextArea label={t("cliente.agenda.observaciones")} {...uiProps("observaciones")} />
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
