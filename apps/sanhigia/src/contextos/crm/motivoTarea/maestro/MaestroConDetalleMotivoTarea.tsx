import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useCallback, useEffect } from "react";
import { CrearMotivoTarea } from "../crear/CrearMotivoTarea.tsx";
import { DetalleMotivoTarea } from "../detalle/DetalleMotivoTarea.tsx";
import { MotivoTarea } from "../diseño.ts";
import { metaTablaMotivoTarea } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

export const MaestroConDetalleMotivoTarea = () => {
  const { id, criteria } = getUrlParams();

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    motivosTarea: listaActivaEntidadesInicial<MotivoTarea>(id, criteria),
  });

  useUrlParams(ctx.motivosTarea.activo, ctx.motivosTarea.criteria);

  useEffect(() => {
    emitir("recarga_de_motivos_tarea_solicitada", ctx.motivosTarea.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirCreacion = useCallback(() => {
    emitir("creacion_motivo_tarea_solicitada");
  }, [emitir]);

  return (
    <div className="MotivoTarea">
      <MaestroDetalle<MotivoTarea>
        Maestro={
          <>
            <h2>Motivos de tarea</h2>
            <Listado<MotivoTarea>
              metaTabla={metaTablaMotivoTarea}
              modo="tabla"
              criteria={ctx.motivosTarea.criteria}
              entidades={ctx.motivosTarea.lista}
              totalEntidades={ctx.motivosTarea.total}
              seleccionada={ctx.motivosTarea.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton onClick={abrirCreacion}>Nuevo motivo de tarea</QBoton>
                </div>
              )}
              onSeleccion={(payload) =>
                emitir("motivo_tarea_seleccionado", payload)
              }
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
              onSiguientePagina={(payload) =>
                emitir("siguiente_pagina", payload)
              }
            />
          </>
        }
        Detalle={
          <DetalleMotivoTarea
            id={ctx.motivosTarea.activo}
            publicar={emitir}
          />
        }
        seleccionada={ctx.motivosTarea.activo}
        modoDisposicion="maestro-50"
      />

      <CrearMotivoTarea
        publicar={emitir}
        onCancelar={() => emitir("creacion_motivo_tarea_cancelada")}
        activo={ctx.estado === "CREANDO_MOTIVO_TAREA"}
      />
    </div>
  );
};
