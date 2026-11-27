import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { getLead, postLead } from "../infraestructura.ts";
import "./CrearLead.css";
import { metaNuevoLead, nuevoLeadVacio } from "./crear.ts";
import { useTCrm } from "../../i18n/index.ts";

export const CrearLead = ({ publicar }: { publicar: EmitirEvento }) => {
  const t = useTCrm();
  const { modelo, uiProps, valido } = useModelo(metaNuevoLead, nuevoLeadVacio);

  const crear_ = useCallback(async () => {
    const id = await postLead(modelo);
    const lead = await getLead(id);
    publicar("lead_creado", lead);
  }, [modelo, publicar]);

  const cancelar_ = useCallback(() => {
    publicar("creacion_lead_cancelada");
  }, [publicar]);

  const [crear, cancelar] = useForm(crear_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo={t("lead.nuevoLead")}
      onCerrar={cancelar}
    >
      <div className="CrearLead">
        <quimera-formulario>
          <QInput label={t("lead.nombre")} {...uiProps("nombre")} />
        </quimera-formulario>

        <div className="botones">
          <QBoton onClick={crear} deshabilitado={!valido}>
            {t("lead.crear")}
          </QBoton>
          <QBoton onClick={cancelar} variante="texto">
            {t("lead.cancelar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
