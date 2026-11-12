import { MotivoTarea } from "../diseño.ts";

export type EstadoDetalleMotivoTarea = "INICIAL" | "BORRANDO";

export type ContextoDetalleMotivoTarea = {
    estado: EstadoDetalleMotivoTarea;
    motivoTarea: MotivoTarea;
};
