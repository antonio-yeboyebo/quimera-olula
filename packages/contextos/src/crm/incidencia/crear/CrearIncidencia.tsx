import { EstadoIncidencia } from "#/crm/comun/componentes/EstadoIncidencia.tsx";
import { PrioridadIncidencia } from "#/crm/comun/componentes/PrioridadIncidencia.tsx";
import { TipoIncidencia } from "#/crm/comun/componentes/TipoIncidencia.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QDate, QModal, QTextArea } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { getIncidencia, postIncidencia } from "../infraestructura.ts";
import "./CrearIncidencia.css";
import { metaNuevaIncidencia, nuevaIncidenciaVacia } from "./crear.ts";
import { useTCrm } from "../../i18n/index.ts";

export const CrearIncidencia = ({ publicar }: { publicar: EmitirEvento }) => {
  const t = useTCrm();
  const { modelo, uiProps, valido } = useModelo(
    metaNuevaIncidencia,
    nuevaIncidenciaVacia
  );

  const crear_ = useCallback(async () => {
    const id = await postIncidencia(modelo);
    const incidencia = await getIncidencia(id);
    publicar("incidencia_creada", incidencia);
  }, [modelo, publicar]);

  const cancelar_ = useCallback(() => {
    publicar("creacion_incidencia_cancelada");
  }, [publicar]);

  const [crear, cancelar] = useForm(crear_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo={t("incidencia.nuevaIncidencia")}
      onCerrar={cancelar}
    >
      <div className="CrearIncidencia">
        <quimera-formulario>
          <QInput label={t("incidencia.descripcion")} {...uiProps("descripcion")} />
          <QInput label={t("incidencia.nombre")} {...uiProps("nombre")} />
          <QDate label={t("incidencia.fecha")} {...uiProps("fecha")} />
          <PrioridadIncidencia {...uiProps("prioridad")} />
          <EstadoIncidencia {...uiProps("estado")} />
          <TipoIncidencia {...uiProps("tipo_incidencia")} />
          <QTextArea
            label={t("incidencia.descripcionLarga")}
            rows={5}
            {...uiProps("descripcion_larga")}
          />
        </quimera-formulario>

        <div className="botones">
          <QBoton onClick={crear} deshabilitado={!valido}>
            {t("incidencia.guardar")}
          </QBoton>
          <QBoton onClick={cancelar} variante="texto">
            {t("incidencia.cancelar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
