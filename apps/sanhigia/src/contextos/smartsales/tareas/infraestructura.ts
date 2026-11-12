import { LegacyAPI, legacyUrl } from "@olula/lib/api/legacy_api.ts";
import { Tarea } from "../comun/diseño.ts";
import { FiltroTareasRango, TareaAPI } from "./diseño.ts";

const baseUrl = "ss_tareas";

const campos = [
    "idtarea",
    "titulo",
    "fecha",
    "hora",
    "tipo",
    "completada",
    "encurso",
    "nombrecliente",
    "nombrecontactotrato",
];

export const tareaDesdeAPI = (tarea: TareaAPI): Tarea => ({
    id: String(tarea.idtarea),
    titulo: tarea.titulo,
    fecha: tarea.fecha.slice(0, 10),
    hora: tarea.hora,
    tipo: tarea.tipo,
    completada: tarea.completada,
    enCurso: !!tarea.encurso,
    nombreCliente: tarea.nombrecliente,
    nombreContacto: tarea.nombrecontactotrato,
});

const filtroAgente = (agente: string | null) => (agente ? { and: [["codagente", "eq", agente]] } : undefined);

export const getTareasRango = async ({ desde, hasta, agente, conAtrasadas = false }: FiltroTareasRango) => {
    const respuesta = await LegacyAPI.get<{ data: TareaAPI[] }>(
        legacyUrl(baseUrl, {
            action: "get_for_rango",
            staticAction: true,
            params: {
                filter: filtroAgente(agente),
                fields: campos,
                extra: { desde, hasta, conAtrasadas },
            },
        })
    );

    return respuesta.data.map(tareaDesdeAPI);
};

export const getTareasCompletadas = async (agente: string | null, limite = 30) => {
    const respuesta = await LegacyAPI.get<{ data: TareaAPI[] }>(
        legacyUrl(baseUrl, {
            params: {
                filter: { and: [["completada", "eq", true], ...(agente ? [["codagente", "eq", agente]] : [])] },
                fields: campos,
                order: { field: "fecha", direction: "DESC" },
                page: { limit: limite },
            },
        })
    );

    return respuesta.data.map(tareaDesdeAPI);
};

export const getTareasTrato = async (idTrato: string) => {
    const respuesta = await LegacyAPI.get<{ data: TareaAPI[] }>(
        legacyUrl(baseUrl, {
            params: {
                filter: { and: [["idtrato", "eq", Number(idTrato)]] },
                fields: campos,
                order: { field: "fecha", direction: "ASC" },
                page: { limit: 100 },
            },
        })
    );

    return respuesta.data.map(tareaDesdeAPI);
};
