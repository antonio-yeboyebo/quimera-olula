import ComunUrls from "#/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import {
    Comunicacion,
    ESTADOS_COMUNICACION,
    GetComunicacion,
    GetComunicaciones,
} from "./diseño.ts";
import { tComun } from "../i18n/index.ts";

type ComunicacionAPI = {
    id: number | string;
    usuario_destino_id: number | string;
    estado: string;
    asunto: string;
    cuerpo: string;
    fecha_envio: string;
    fecha_lectura: string | null;
    fecha_borrado: string | null;
};

type ComunicacionPayloadAPI = {
    usuario_destino_id: number | string;
    asunto: string;
    cuerpo: string;
};

const baseUrl = new ComunUrls().COMUNICACION;

export const comunicacionDesdeAPI = (
    comunicacionApi: ComunicacionAPI
): Comunicacion => ({
    id: comunicacionApi.id.toString(),
    usuarioDestinoId: comunicacionApi.usuario_destino_id.toString(),
    estado: comunicacionApi.estado as Comunicacion["estado"],
    asunto: comunicacionApi.asunto,
    cuerpo: comunicacionApi.cuerpo,
    fechaEnvio: new Date(Date.parse(comunicacionApi.fecha_envio)),
    fechaLectura: comunicacionApi.fecha_lectura
        ? new Date(Date.parse(comunicacionApi.fecha_lectura))
        : null,
    fechaBorrado: comunicacionApi.fecha_borrado
        ? new Date(Date.parse(comunicacionApi.fecha_borrado))
        : null,
});

export const getComunicaciones: GetComunicaciones = async (
    filtro: Filtro,
    orden: Orden,
    paginacion: Paginacion
): RespuestaLista<Comunicacion> => {
    const q = criteriaQuery(filtro, orden, paginacion);

    const respuesta = await RestAPI.get<{ datos: ComunicacionAPI[]; total: number }>(
        `${baseUrl}${q}`
    );

    return {
        datos: respuesta.datos.map(comunicacionDesdeAPI),
        total: respuesta.total,
    };
};

export const getComunicacion: GetComunicacion = async (
    id: string
): Promise<Comunicacion> => {
    const respuesta = await RestAPI.get<{ datos: ComunicacionAPI }>(`${baseUrl}/${id}`);
    return comunicacionDesdeAPI(respuesta.datos);
};

export const postComunicacion = async (
    comunicacion: ComunicacionPayloadAPI
): Promise<string> => {
    const respuesta = await RestAPI.post<ComunicacionPayloadAPI>(
        baseUrl,
        comunicacion,
        tComun("comunicacion.errorAlCrearComunicacion")
    );

    return respuesta.id.toString();
};

export const marcarComunicacionLeida = async (id: string): Promise<void> => {
    await RestAPI.patch(`${baseUrl}/${id}/marcar_leida`, {}, tComun("comunicacion.errorAlMarcarComunicacionComoLeida"));
};

export const marcarComunicacionNoLeida = async (id: string): Promise<void> => {
    await RestAPI.patch(
        `${baseUrl}/${id}/marcar_no_leida`,
        {},
        tComun("comunicacion.errorAlMarcarComunicacionComoNo")
    );
};

export const borrarComunicacion = async (id: string): Promise<void> => {
    await RestAPI.delete(`${baseUrl}/${id}`, tComun("comunicacion.errorAlBorrarComunicacion"));
};


export const getTotalComunicacionesNoLeidas = async (): Promise<number> => {
    const respuesta = await getComunicaciones(
        [["estado", "=", ESTADOS_COMUNICACION.NO_LEIDA]],
        [],
        { pagina: 1, limite: 1 }
    );

    return respuesta.total;
};
