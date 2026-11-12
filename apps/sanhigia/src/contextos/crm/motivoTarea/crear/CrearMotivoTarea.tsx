import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput, QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useState } from "react";
import { NuevoMotivoTarea } from "../diseño.ts";
import { getMotivoTarea, postMotivoTarea } from "../infraestructura.ts";
import "./CrearMotivoTarea.css";
import { metaNuevoMotivoTarea, nuevoMotivoTareaVacio } from "./dominio.ts";

export const CrearMotivoTarea = ({
  publicar = async () => {},
  onCancelar = () => {},
  activo = false,
}: {
  publicar?: EmitirEvento;
  onCancelar?: () => void;
  activo?: boolean;
}) => {
  const { intentar } = useContext(ContextoError);
  const [creando, setCreando] = useState(false);
  const { modelo, uiProps, valido, init } = useModelo(
    metaNuevoMotivoTarea,
    nuevoMotivoTareaVacio
  );
  const motivoTarea = modelo as NuevoMotivoTarea;

  const cerrar = useCallback(() => {
    if (creando) return;

    init(nuevoMotivoTareaVacio);
    onCancelar();
  }, [creando, init, onCancelar]);

  const crear = useCallback(async () => {
    if (!valido) return;

    setCreando(true);
    try {
      const motivoTareaId: string = await intentar(() =>
        postMotivoTarea({
          descripcion: String(motivoTarea.descripcion ?? "").trim(),
          activo: motivoTarea.activo,
        })
      );
      const motivoTareaCreado = await intentar(() =>
        getMotivoTarea(motivoTareaId)
      );

      publicar("motivo_tarea_creado", motivoTareaCreado);
      init(nuevoMotivoTareaVacio);
      onCancelar();
    } finally {
      setCreando(false);
    }
  }, [init, intentar, motivoTarea, onCancelar, publicar, valido]);

  if (!activo) return null;

  return (
    <QModal
      abierto={activo}
      nombre="crear_motivo_tarea"
      titulo="Nuevo motivo de tarea"
      onCerrar={cerrar}
    >
      <div className="crear-motivo-tarea">
        <quimera-formulario>
          <QInput label="Descripción" {...uiProps("descripcion")} />
          <QCheckbox label="Activo" {...uiProps("activo")} />
        </quimera-formulario>

        <div className="botones maestro-botones">
          <QBoton onClick={crear} deshabilitado={!valido || creando}>
            Guardar
          </QBoton>
          <QBoton onClick={cerrar} variante="texto">
            Cancelar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
