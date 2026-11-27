import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { getContacto, postContacto } from "../infraestructura.ts";
import "./CrearContacto.css";
import { metaNuevoContacto, nuevoContactoVacio } from "./crear.ts";
import { useTCrm } from "../../i18n/index.ts";

export const CrearContacto = ({ publicar }: { publicar: EmitirEvento }) => {
  const t = useTCrm();
  const { modelo, uiProps, valido } = useModelo(
    metaNuevoContacto,
    nuevoContactoVacio
  );

  const crear_ = useCallback(async () => {
    const id = await postContacto(modelo);
    const contacto = await getContacto(id);
    publicar("contacto_creado", contacto);
  }, [modelo, publicar]);

  const cancelar_ = useCallback(() => {
    publicar("creacion_contacto_cancelada");
  }, [publicar]);

  const [crear, cancelar] = useForm(crear_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo={t("contacto.nuevoContacto")}
      onCerrar={cancelar}
    >
      <div className="CrearContacto">
        <quimera-formulario>
          <QInput label={t("contacto.nombre")} {...uiProps("nombre")} />
          <QInput label={t("contacto.email")} {...uiProps("email")} />
          <QInput label={t("contacto.telefono")} {...uiProps("telefono1")} />
        </quimera-formulario>

        <div className="botones">
          <QBoton onClick={crear} deshabilitado={!valido}>
            {t("contacto.crear")}
          </QBoton>
          <QBoton onClick={cancelar} variante="texto">
            {t("contacto.cancelar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
