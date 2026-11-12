import { LegacyAPI, legacyUrl } from "@olula/lib/api/legacy_api.ts";
import { Tarea } from "../comun/diseño.ts";
import { fechaIso } from "../comun/dominio.ts";
import { TareaAPI } from "../tareas/diseño.ts";
import { tareaDesdeAPI } from "../tareas/infraestructura.ts";
import { CambiosContactoAPI, Contacto, ContactoAPI, EventoContacto, NotaContacto, TratoContacto } from "./diseño.ts";
import { contactoDesdeAPI } from "./dominio.ts";

const camposTarea = ["idtarea", "titulo", "fecha", "hora", "tipo", "completada", "encurso", "nombrecliente", "nombrecontactotrato", "codagente"];

export const getContacto = async (codContacto: string): Promise<Contacto> => {
    const respuesta = await LegacyAPI.get<{ data: ContactoAPI[] }>(legacyUrl("contactos", { id: codContacto }));
    const contacto = respuesta.data[0];
    if (!contacto) throw { nombre: "Contacto no encontrado", descripcion: `No existe el contacto ${codContacto} o no tienes acceso` };
    return contactoDesdeAPI(contacto);
};

export const getContactoPorEmail = async (email: string): Promise<string | null> => {
    const respuesta = await LegacyAPI.get<{ data: { codcontacto: string }[] }>(
        legacyUrl("contactos", {
            params: { filter: { and: [["email", "eq", email.trim()]] }, fields: ["codcontacto"], page: { limit: 1 } },
        })
    );
    return respuesta.data[0]?.codcontacto ?? null;
};

export const crearContacto = async (contacto: CambiosContactoAPI): Promise<string> => {
    const respuesta = await LegacyAPI.post<CambiosContactoAPI, { pk: string }>(legacyUrl("contactos"), contacto);
    return String(respuesta.pk);
};

export const actualizarContacto = (codContacto: string, cambios: CambiosContactoAPI) =>
    LegacyAPI.patch<CambiosContactoAPI>(legacyUrl("contactos", { id: codContacto }), cambios);

export const borrarContacto = (codContacto: string) => LegacyAPI.delete(legacyUrl("contactos", { id: codContacto }));

export const getTratosContacto = async (codContacto: string, historico: boolean): Promise<TratoContacto[]> => {
    const respuesta = await LegacyAPI.get<{
        data: { idtrato: number; titulo: string; estado: string | null; valor: number | null; fecha: string | null; codagente: string | null }[];
    }>(
        legacyUrl("ss_tratos", {
            params: {
                filter: {
                    and: [["codcontacto", "eq", codContacto], ...(historico ? [] : [["estado", "not_in", ["Ganado", "Perdido"]]])],
                },
                fields: ["idtrato", "titulo", "estado", "valor", "fecha", "codagente"],
                order: { field: "fecha", direction: "DESC" },
                page: { limit: 100 },
            },
        })
    );
    return respuesta.data.map((t) => ({
        id: String(t.idtrato),
        titulo: t.titulo,
        estado: t.estado ?? "-",
        valor: Number(t.valor) || 0,
        fecha: t.fecha?.slice(0, 10) ?? null,
        codAgente: t.codagente,
    }));
};

export const getTareasContacto = async (codContacto: string, historico: boolean): Promise<{ tarea: Tarea; codAgente: string | null }[]> => {
    const respuesta = await LegacyAPI.get<{ data: (TareaAPI & { codagente: string | null })[] }>(
        legacyUrl("ss_tareas", {
            action: "get_by_contacto",
            staticAction: true,
            params: {
                filter: { and: [["codcontacto", "eq", codContacto], ...(historico ? [] : [["completada", "eq", false]])] },
                fields: camposTarea,
                order: { field: "fecha", direction: "DESC" },
                page: { limit: 100 },
            },
        })
    );
    return respuesta.data.map((t) => ({ tarea: tareaDesdeAPI(t), codAgente: t.codagente }));
};

export const getEventosContacto = async (codContacto: string): Promise<EventoContacto[]> => {
    const respuesta = await LegacyAPI.get<{ data: { codevento: string; nombre: string; fechaini: string | null }[] }>(
        legacyUrl("eventos", {
            action: "get_eventos_contacto",
            staticAction: true,
            params: {
                filter: { and: [["codcontacto", "eq", codContacto]] },
                order: { field: "fechaini", direction: "DESC" },
                page: { limit: 100 },
            },
        })
    );
    return respuesta.data.map((e) => ({ codigo: e.codevento, nombre: e.nombre, fecha: e.fechaini?.slice(0, 10) ?? null }));
};

export const getNotasContacto = async (codContacto: string): Promise<NotaContacto[]> => {
    const respuesta = await LegacyAPI.get<{ data: { idnota: number; texto: string; fecha: string }[] }>(
        legacyUrl("contactos", {
            action: "get_notas",
            staticAction: true,
            params: {
                filter: { and: [["codcontacto", "eq", codContacto]] },
                order: { field: "fecha", direction: "DESC" },
                page: { limit: 100 },
            },
        })
    );
    return respuesta.data.map((n) => ({ id: String(n.idnota), texto: n.texto, fecha: n.fecha.slice(0, 10) }));
};

export const añadirNotaContacto = (codContacto: string, texto: string) =>
    LegacyAPI.post(legacyUrl("contactos", { action: "add_nota", staticAction: true }), {
        codcontacto: codContacto,
        texto,
        fecha: fechaIso(new Date()),
    });
