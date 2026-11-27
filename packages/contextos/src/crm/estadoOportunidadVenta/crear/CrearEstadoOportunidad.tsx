import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import {
  getEstadoOportunidad,
  postEstadoOportunidad,
} from "../infraestructura.ts";
import "./CrearEstadoOportunidad.css";
import {
  metaNuevoEstadoOportunidad,
  nuevoEstadoOportunidadVacio,
} from "./crear.ts";
import { useTCrm } from "../../i18n/index.ts";

export const CrearEstadoOportunidad = ({
  publicar,
}: {
  publicar: EmitirEvento;
}) => {
  const t = useTCrm();
  const { modelo, uiProps, valido } = useModelo(
    metaNuevoEstadoOportunidad,
    nuevoEstadoOportunidadVacio
  );

  const crear_ = useCallback(async () => {
    const id = await postEstadoOportunidad(modelo);
    const estado_oportunidad = await getEstadoOportunidad(id);
    publicar("estado_oportunidad_creado", estado_oportunidad);
  }, [modelo, publicar]);

  const cancelar_ = useCallback(() => {
    publicar("creacion_estado_oportunidad_cancelada");
  }, [publicar]);

  const [crear, cancelar] = useForm(crear_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo={t("estadoOportunidadVenta.nuevoEstadoDeOportunidadDeVenta")}
      onCerrar={cancelar}
    >
      <div className="CrearEstadoOportunidad">
        <quimera-formulario>
          <QInput label={t("estadoOportunidadVenta.codigo")} maxLength={10} {...uiProps("id")} />
          <QInput label={t("estadoOportunidadVenta.descripcion")} {...uiProps("descripcion")} />
          <QInput label={t("estadoOportunidadVenta.probabilidad")} {...uiProps("probabilidad")} />
        </quimera-formulario>

        <div className="botones">
          <QBoton onClick={crear} deshabilitado={!valido}>
            {t("estadoOportunidadVenta.guardar")}
          </QBoton>
          <QBoton onClick={cancelar} variante="texto">
            {t("estadoOportunidadVenta.cancelar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
