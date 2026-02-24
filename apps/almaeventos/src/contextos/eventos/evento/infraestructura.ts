import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { Evento, NuevoEvento } from "./diseño.ts";
import { reemplazarNulls } from "./dominio.ts";

const baseUrlEvento = `/eventos/evento`;

// Helper para convertir fechas a string ISO respetando zona horaria local
const fechaAISOLocal = (fecha: Date): string => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
};

type EventoAPI = Evento & {
    fecha_inicio: string
}


export const eventoDesdeAPI = (e: EventoAPI): Evento => (
    {
        ...e,
        fechaInicio: new Date(Date.parse(e.fecha_inicio)),
    }
);

export const eventoToAPI = (e: NuevoEvento) => {
    const { fechaInicio, ...resto } = e;
    const fechaFormateada = !fechaInicio ? null : (fechaInicio instanceof Date ? fechaAISOLocal(fechaInicio) : fechaInicio);

    return {
        ...resto,
        fecha_inicio: fechaFormateada,
        // fecha_inicio: !fechaInicio ? null : (fechaInicio instanceof Date ? fechaInicio.toISOString().split('T')[0] : fechaInicio),
        // valordefecto: e.valor_defecto,
    };
};


export const getEvento = async (evento_id: string): Promise<Evento> =>
    await RestAPI.get<{ datos: EventoAPI }>(`${baseUrlEvento}/${evento_id}`).then((respuesta) => eventoDesdeAPI(respuesta.datos));

export const getEventos = async (
    filtro: Filtro,
    orden: Orden = ["finicio", "DESC"],
    paginacion: Paginacion
): RespuestaLista<Evento> => {
    const q = criteriaQuery(filtro, orden, paginacion);

    const respuesta = await RestAPI.get<{ datos: EventoAPI[]; total: number }>(baseUrlEvento + q);
    return { datos: respuesta.datos.map(eventoDesdeAPI), total: respuesta.total };
};

export const postEvento = async (_evento: NuevoEvento): Promise<string> => {
    return await RestAPI.post(baseUrlEvento, eventoToAPI(_evento)).then((respuesta) => respuesta.id);
};

export const patchEvento = async (evento_id: string, evento: Partial<Evento>): Promise<void> => {
    const eventoSinNulls = reemplazarNulls(evento);
    await RestAPI.patch(`${baseUrlEvento}/${evento_id}`, { cambios: eventoSinNulls });
};

export const deleteEvento = async (evento_id: string): Promise<void> =>
    await RestAPI.delete(`${baseUrlEvento}/${evento_id}`);

export const descargarHojaRuta = async (evento_id: string): Promise<Blob> => {
    const url = `${baseUrlEvento}/${evento_id}/hoja_ruta_evento`;
    return await RestAPI.blob(url);
};