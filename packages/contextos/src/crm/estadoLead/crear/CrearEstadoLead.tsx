import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { getEstadoLead, postEstadoLead } from "../infraestructura.ts";
import "./CrearEstadoLead.css";
import { metaNuevoEstadoLead, nuevoEstadoLeadVacio } from "./crear.ts";
import { useTCrm } from "../../i18n/index.ts";

export const CrearEstadoLead = ({ publicar }: { publicar: EmitirEvento }) => {
  const t = useTCrm();
  const { modelo, uiProps, valido } = useModelo(
    metaNuevoEstadoLead,
    nuevoEstadoLeadVacio
  );

  const crear_ = useCallback(async () => {
    const id = await postEstadoLead(modelo);
    const estado_lead = await getEstadoLead(id);
    publicar("estado_lead_creado", estado_lead);
  }, [modelo, publicar]);

  const cancelar_ = useCallback(() => {
    publicar("creacion_estado_lead_cancelada");
  }, [publicar]);

  const [crear, cancelar] = useForm(crear_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo={t("estadoLead.nuevoEstadoDeLead")}
      onCerrar={cancelar}
    >
      <div className="CrearEstadoLead">
        <quimera-formulario>
          <QInput label={t("estadoLead.codigo")} maxLength={10} {...uiProps("id")} />
          <QInput label={t("estadoLead.descripcion")} {...uiProps("descripcion")} />
        </quimera-formulario>

        <div className="botones">
          <QBoton onClick={crear} deshabilitado={!valido}>
            {t("estadoLead.guardar")}
          </QBoton>
          <QBoton onClick={cancelar} variante="texto">
            {t("estadoLead.cancelar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
