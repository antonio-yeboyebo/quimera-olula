import { ProcesarContexto } from "@olula/lib/diseño.js";
import {
  ejecutarListaProcesos,
  MetaModelo,
  stringNoVacio,
} from "@olula/lib/dominio.js";
import { pipe } from "@olula/lib/funcional.js";
import { MotivoTarea } from "../diseño.ts";
import { motivoTareaVacio } from "../dominio.ts";
import { getMotivoTarea, patchMotivoTarea } from "../infraestructura.ts";
import {
  ContextoDetalleMotivoTarea,
  EstadoDetalleMotivoTarea,
} from "./diseño.ts";

export const metaMotivoTarea: MetaModelo<MotivoTarea> = {
  campos: {
    id: { requerido: true },
    descripcion: {
      requerido: true,
      validacion: (motivoTarea: MotivoTarea) =>
        stringNoVacio(String(motivoTarea.descripcion ?? "")),
    },
    activo: { requerido: true, tipo: "checkbox" },
  },
};

type ProcesarDetalleMotivoTarea = ProcesarContexto<
  EstadoDetalleMotivoTarea,
  ContextoDetalleMotivoTarea
>;

const pipeDetalleMotivoTarea = ejecutarListaProcesos<
  EstadoDetalleMotivoTarea,
  ContextoDetalleMotivoTarea
>;

const conMotivoTarea =
  (motivoTarea: MotivoTarea) => (ctx: ContextoDetalleMotivoTarea) => ({
    ...ctx,
    motivoTarea,
  });

const conEstado =
  (estado: EstadoDetalleMotivoTarea) => (ctx: ContextoDetalleMotivoTarea) => ({
    ...ctx,
    estado,
  });

const cargarMotivoTarea =
  (id: string): ProcesarDetalleMotivoTarea =>
  async (contexto) => {
    const motivoTarea = await getMotivoTarea(id);

    return pipe(contexto, conMotivoTarea(motivoTarea));
  };

export const refrescarMotivoTarea: ProcesarDetalleMotivoTarea = async (
  contexto
) => {
  const motivoTarea = await getMotivoTarea(contexto.motivoTarea.id);

  return [
    pipe(
      contexto,
      conMotivoTarea({
        ...contexto.motivoTarea,
        ...motivoTarea,
      })
    ),
    [["motivo_tarea_cambiado", motivoTarea]],
  ];
};

export const cambiarMotivoTarea: ProcesarDetalleMotivoTarea = async (
  contexto,
  payload
) => {
  const motivoTarea = payload as MotivoTarea;
  await patchMotivoTarea(contexto.motivoTarea.id, motivoTarea);

  return pipeDetalleMotivoTarea(contexto, [refrescarMotivoTarea, "INICIAL"]);
};

export const getContextoVacio: ProcesarDetalleMotivoTarea = async (
  contexto
) => {
  return pipe(
    contexto,
    conEstado("INICIAL"),
    conMotivoTarea(motivoTareaVacio)
  );
};

export const cargarContexto: ProcesarDetalleMotivoTarea = async (
  contexto,
  payload
) => {
  const id = payload as string;

  if (!id) return getContextoVacio(contexto);

  return pipeDetalleMotivoTarea(contexto, [cargarMotivoTarea(id)]);
};
