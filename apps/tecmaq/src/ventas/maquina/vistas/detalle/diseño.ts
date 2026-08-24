import { Maquina } from "../../diseño.ts";

export type EstadoDetalleMaquina = "INICIAL" | "ABIERTO";

export type ContextoDetalleMaquina = {
    estado: EstadoDetalleMaquina;
    maquina: Maquina;
};
