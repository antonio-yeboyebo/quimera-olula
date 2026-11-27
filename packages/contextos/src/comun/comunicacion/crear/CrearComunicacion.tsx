import { Usuario } from "#/comun/componentes/usuario.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import type { JSONContent } from "@olula/componentes/moleculas/qeditor_enriquecido.tsx";
import {
  QEditorEnriquecido,
  QTextEnriquecidoJSON,
} from "@olula/componentes/moleculas/qeditor_enriquecido.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext, useState } from "react";
import { getComunicacion, postComunicacion } from "../infraestructura.ts";
import "./CrearComunicacion.css";
import {
  jsonComunicacionVacio,
  metaNuevaComunicacion,
  nuevaComunicacionVacia,
} from "./dominio.ts";
import { useTComun } from "../../i18n/index.ts";

interface CrearComunicacionProps {
  publicar?: EmitirEvento;
  onCancelar?: () => void;
  activo?: boolean;
}

export const CrearComunicacion = ({
  publicar = async () => {},
  onCancelar = () => {},
  activo = false,
}: CrearComunicacionProps) => {
  const t = useTComun();
  const { modelo, uiProps, valido, init } = useModelo(
    metaNuevaComunicacion,
    nuevaComunicacionVacia
  );
  const [jsonEditor, setJsonEditor] = useState<JSONContent>(
    jsonComunicacionVacio
  );
  const [guardando, setGuardando] = useState(false);
  const { intentar } = useContext(ContextoError);

  const limpiarFormulario = () => {
    init(nuevaComunicacionVacia);
    setJsonEditor(jsonComunicacionVacio);
  };

  const cancelar = () => {
    if (guardando) {
      return;
    }

    limpiarFormulario();
    onCancelar();
  };

  const guardar = async () => {
    if (!valido) {
      return;
    }

    setGuardando(true);
    try {
      const cuerpo = JSON.stringify(jsonEditor);

      const id = await intentar(() =>
        postComunicacion({
          usuario_destino_id: modelo.usuario_destino_id.trim(),
          asunto: modelo.asunto.trim(),
          cuerpo,
        })
      );

      const comunicacionCreada = await getComunicacion(id);
      publicar("comunicacion_creada", comunicacionCreada);
      limpiarFormulario();
      onCancelar();
    } finally {
      setGuardando(false);
    }
  };

  if (!activo) return null;

  return (
    <QModal
      nombre="crear-comunicacion"
      titulo={t("comunicacion.nuevaComunicacion")}
      abierto={activo}
      onCerrar={cancelar}
    >
      <div className="crear-comunicacion-modal">
        <Usuario
          {...uiProps("usuario_destino_id", "nombre_usuario_destino")}
          label={t("comunicacion.responsable")}
        />

        <QInput label={t("comunicacion.asunto")} {...uiProps("asunto")} />

        <QEditorEnriquecido
          valor={jsonEditor}
          onChange={(valor) => {
            setJsonEditor(valor);
          }}
          marcadorPosicion={t("comunicacion.escribeElContenido")}
        />

        <section className="crear-comunicacion-preview">
          <h4>{t("comunicacion.vistaLecturaComponenteDeSoloLectura")}</h4>
          <QTextEnriquecidoJSON valor={jsonEditor} />
        </section>

        <div className="crear-comunicacion-botones">
          <QBoton variante="borde" onClick={cancelar}>
            {t("comunicacion.cancelar")}
          </QBoton>
          <QBoton onClick={guardar} deshabilitado={guardando || !valido}>
            {guardando ? t("comunicacion.guardando") : t("comunicacion.guardar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
