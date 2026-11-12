import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Detalle, QBoton, QInput } from "@olula/componentes/index.js";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { useParams } from "react-router";
import { BorrarMotivoTarea } from "../borrar/BorrarMotivoTarea.tsx";
import { motivoTareaVacio } from "../dominio.ts";
import "./DetalleMotivoTarea.css";
import { metaMotivoTarea } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";

export const DetalleMotivoTarea = ({
  id,
  publicar,
}: {
  id?: string;
  publicar: EmitirEvento;
}) => {
  const params = useParams();
  const motivoTareaId = id ?? params.id;
  const titulo = (motivoTarea: Entidad) => motivoTarea.descripcion as string;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      motivoTarea: motivoTareaVacio,
    },
    publicar
  );

  const motivoTarea = useModelo(metaMotivoTarea, ctx.motivoTarea);
  const { modelo, modificado, uiProps, valido } = motivoTarea;

  useEffect(() => {
    if (motivoTareaId) {
      emitir("motivo_tarea_id_cambiado", motivoTareaId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motivoTareaId]);

  return (
    <Detalle
      id={motivoTareaId}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={modelo}
      cerrarDetalle={() => emitir("edicion_motivo_tarea_cancelada", null)}
    >
      {!!motivoTareaId && (
        <div className="DetalleMotivoTarea">
          <div className="maestro-botones">
            <QBoton onClick={() => emitir("borrado_motivo_tarea_solicitado")}>
              Borrar
            </QBoton>
          </div>

          <quimera-formulario>
            <QInput label="Descripción" {...uiProps("descripcion")} />
            <QCheckbox label="Activo" {...uiProps("activo")} />
          </quimera-formulario>

          {modificado && (
            <div className="botones maestro-botones">
              <QBoton
                onClick={() => emitir("motivo_tarea_cambiado", modelo)}
                deshabilitado={!valido}
              >
                Guardar
              </QBoton>
              <QBoton
                tipo="reset"
                variante="texto"
                onClick={() => emitir("edicion_motivo_tarea_cancelada")}
              >
                Cancelar
              </QBoton>
            </div>
          )}

          {ctx.estado === "BORRANDO" && (
            <BorrarMotivoTarea publicar={emitir} motivoTarea={modelo} />
          )}
        </div>
      )}
    </Detalle>
  );
};
