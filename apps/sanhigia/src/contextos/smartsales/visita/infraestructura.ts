import { LegacyAPI, legacyUrl } from "@olula/lib/api/legacy_api.ts";
import { Posicion } from "../comun/geolocalizacion.ts";
import { CausaPerdida, Contacto, EstadoTrato, FinalizacionAPI, TareaVisita, TareaVisitaAPI } from "./diseño.ts";

const camposTarea = [
    "idtarea",
    "titulo",
    "tipo",
    "fecha",
    "hora",
    "completada",
    "encurso",
    "fechainicio",
    "horainicio",
    "latitudinicio",
    "longitudinicio",
    "nota",
    "idtrato",
    "codcliente",
    "codclienteincidencia",
    "nombrecliente",
    "interlocutor",
];

const tareaDesdeAPI = (tarea: TareaVisitaAPI): TareaVisita => ({
    id: String(tarea.idtarea),
    titulo: tarea.titulo,
    tipo: tarea.tipo,
    fecha: tarea.fecha.slice(0, 10),
    hora: tarea.hora,
    completada: tarea.completada,
    enCurso: !!tarea.encurso,
    fechaInicio: tarea.fechainicio?.slice(0, 10) ?? null,
    horaInicio: tarea.horainicio,
    posicionInicio:
        tarea.latitudinicio !== null && tarea.longitudinicio !== null
            ? { latitud: Number(tarea.latitudinicio), longitud: Number(tarea.longitudinicio) }
            : null,
    nota: tarea.nota ?? "",
    idTrato: tarea.idtrato ? String(tarea.idtrato) : null,
    codCliente: tarea.codcliente ?? tarea.codclienteincidencia,
    nombreCliente: tarea.nombrecliente,
    interlocutor: tarea.interlocutor,
});

export const getTareaVisita = async (id: string): Promise<TareaVisita> => {
    const respuesta = await LegacyAPI.get<{ data: TareaVisitaAPI[] }>(
        legacyUrl("ss_tareas", { id, params: { fields: camposTarea } })
    );
    const tarea = respuesta.data[0];
    if (!tarea) throw { nombre: "Tarea no encontrada", descripcion: `No existe la tarea ${id} o no tienes acceso` };
    return tareaDesdeAPI(tarea);
};

export const getContactosCliente = async (codCliente: string): Promise<Contacto[]> => {
    const respuesta = await LegacyAPI.get<{ data: { codcontacto: string; nombre: string }[] }>(
        legacyUrl("contactos", {
            params: {
                filter: { and: [["codcliente", "eq", codCliente]] },
                fields: ["codcontacto", "nombre"],
                page: { limit: 100 },
            },
        })
    );
    return respuesta.data.map((c) => ({ codigo: c.codcontacto, nombre: c.nombre }));
};

export const iniciarVisita = async (id: string, posicion: Posicion | null) =>
    LegacyAPI.post(legacyUrl("ss_tareas", { id, action: "iniciar_visita" }), {
        latitud: posicion?.latitud ?? null,
        longitud: posicion?.longitud ?? null,
    });

export const finalizarTarea = async (id: string, finalizacion: FinalizacionAPI) =>
    LegacyAPI.patch<FinalizacionAPI>(legacyUrl("ss_tareas", { id }), finalizacion);

export const quedanTareasPendientes = async (idTrato: string, idTarea: string): Promise<boolean> => {
    const respuesta = await LegacyAPI.get<{ data: unknown[] }>(
        legacyUrl("ss_tareas", {
            params: {
                filter: {
                    and: [
                        ["idtrato", "eq", Number(idTrato)],
                        ["completada", "eq", false],
                        ["idtarea", "neq", Number(idTarea)],
                    ],
                },
                fields: ["idtarea"],
                page: { limit: 1 },
            },
        })
    );
    return respuesta.data.length > 0;
};

export const getCausasPerdida = async (idTrato: string): Promise<CausaPerdida[]> => {
    const trato = await LegacyAPI.get<{ data: { idtipotrato: number | null }[] }>(
        legacyUrl("ss_tratos", { id: idTrato, params: { fields: ["idtrato", "idtipotrato"] } })
    );
    const idTipoTrato = trato.data[0]?.idtipotrato;
    const respuesta = await LegacyAPI.get<{ data: { idperdida: number; descripcion: string }[] }>(
        legacyUrl("ss_causasperdidatrato", {
            params: {
                filter: idTipoTrato ? { and: [["idtipotrato", "eq", idTipoTrato]] } : undefined,
                fields: ["idperdida", "descripcion"],
                page: { limit: 100 },
            },
        })
    );
    return respuesta.data.map((c) => ({ id: String(c.idperdida), descripcion: c.descripcion }));
};

export const cerrarTrato = async (idTrato: string, estado: EstadoTrato, idCausa: string | null) =>
    LegacyAPI.patch<{ estado: EstadoTrato; idperdida: number | null }>(legacyUrl("ss_tratos", { id: idTrato }), {
        estado,
        idperdida: estado === "Perdido" && idCausa ? Number(idCausa) : null,
    });
