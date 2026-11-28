import { TipoAccion } from "#/crm/comun/componentes/tipo_accion.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { getAccion, postAccion } from "../infraestructura.ts";
import "./CrearAccion.css";
import { metaNuevaAccion, nuevaAccionVacia } from "./crear.ts";
import { NuevaAccion } from "./diseño.ts";
import { useTCrm } from "../../i18n/index.ts";

export const CrearAccion = ({
  publicar,
  modeloVacio = nuevaAccionVacia,
}: {
  publicar: ProcesarEvento;
  modeloVacio?: NuevaAccion;
}) => {
  const t = useTCrm();
  const { modelo, uiProps, valido } = useModelo(metaNuevaAccion, modeloVacio);

  const crear_ = useCallback(async () => {
    const id = await postAccion(modelo);
    const accion = await getAccion(id);
    publicar("accion_creada", accion);
  }, [modelo, publicar]);

  const cancelar_ = useCallback(() => {
    publicar("creacion_accion_cancelada");
  }, [publicar]);

  const [crear, cancelar] = useForm(crear_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo={t("accion.nuevaAccion")}
      onCerrar={cancelar}
    >
      <div className="CrearAccion">
        <quimera-formulario>
          <QInput label={t("accion.descripcion")} {...uiProps("descripcion")} />
          <TipoAccion {...uiProps("tipo")} />
          <QInput label={t("accion.fecha")} {...uiProps("fecha")} />
        </quimera-formulario>

        <div className="botones">
          <QBoton onClick={crear} deshabilitado={!valido}>
            {t("accion.guardar")}
          </QBoton>
          <QBoton onClick={cancelar} variante="texto">
            {t("accion.cancelar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
