import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import { getMaquina } from "../../infraestructura.ts";
import { maquinaVacia } from "../../dominio.ts";
import { ContextoDetalleMaquina, EstadoDetalleMaquina } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleMaquina, ContextoDetalleMaquina>;

const pipeDetalleMaquina = ejecutarListaProcesos<EstadoDetalleMaquina, ContextoDetalleMaquina>;

export const contextoDetalleMaquinaInicial: ContextoDetalleMaquina = {
    estado: "INICIAL",
    maquina: maquinaVacia(),
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (!id) {
        return { ...contexto, estado: "INICIAL", maquina: maquinaVacia() };
    }
    const maquina = await getMaquina(id);
    return pipeDetalleMaquina(contexto, [
        async (ctx) => ({ ...ctx, maquina }),
        "ABIERTO",
    ]);
};
