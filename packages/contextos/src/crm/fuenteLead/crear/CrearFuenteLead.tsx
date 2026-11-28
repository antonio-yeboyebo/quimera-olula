import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { getFuenteLead, postFuenteLead } from "../infraestructura.ts";
import "./CrearFuenteLead.css";
import { metaNuevaFuenteLead, nuevaFuenteLeadVacia } from "./crear.ts";
import { useTCrm } from "../../i18n/index.ts";

export const CrearFuenteLead = ({ publicar }: { publicar: EmitirEvento }) => {
  const t = useTCrm();
  const { modelo, uiProps, valido } = useModelo(
    metaNuevaFuenteLead,
    nuevaFuenteLeadVacia
  );

  const crear_ = useCallback(async () => {
    const id = await postFuenteLead(modelo);
    const fuente_lead = await getFuenteLead(id);
    publicar("fuente_lead_creada", fuente_lead);
  }, [modelo, publicar]);

  const cancelar_ = useCallback(() => {
    publicar("creacion_fuente_lead_cancelada");
  }, [publicar]);

  const [crear, cancelar] = useForm(crear_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo={t("fuenteLead.nuevaFuenteDeLead")}
      onCerrar={cancelar}
    >
      <div className="CrearFuenteLead">
        <quimera-formulario>
          <QInput label={t("fuenteLead.codigo")} maxLength={20} {...uiProps("id")} />
          <QInput label={t("fuenteLead.descripcion")} {...uiProps("descripcion")} />
        </quimera-formulario>

        <div className="botones">
          <QBoton onClick={crear} deshabilitado={!valido}>
            {t("fuenteLead.guardar")}
          </QBoton>
          <QBoton onClick={cancelar} variante="texto">
            {t("fuenteLead.cancelar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
