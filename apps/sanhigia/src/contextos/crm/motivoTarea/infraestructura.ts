import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    Filtro,
    Orden,
    Paginacion,
    RespuestaLista,
} from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import {
    GetMotivoTarea,
    MotivoTarea,
    NuevoMotivoTarea,
    PatchMotivoTarea,
    PostMotivoTarea,
} from "./diseño.ts";

type MotivoTareaApi = {
    id: number | string;
    descripcion: string;
    activo: boolean;
};

const baseUrl = "/crm/motivo_tarea";

const motivoTareaDesdeAPI = (
    motivoTareaApi: MotivoTareaApi
): MotivoTarea => ({
    id: motivoTareaApi.id.toString(),
    descripcion: motivoTareaApi.descripcion,
    activo: motivoTareaApi.activo,
});

export const getMotivosTarea = async (
    filtro: Filtro,
    orden: Orden,
    paginacion: Paginacion
): Promise<RespuestaLista<MotivoTarea>> => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{
        datos: MotivoTareaApi[];
        total: number;
    }>(`${baseUrl}${q}`);

    return {
        datos: respuesta.datos.map(motivoTareaDesdeAPI),
        total: respuesta.total,
    };
};

export const getMotivoTarea: GetMotivoTarea = async (id) => {
    const respuesta = await RestAPI.get<{ datos: MotivoTareaApi }>(
        `${baseUrl}/${id}`
    );

    return motivoTareaDesdeAPI(respuesta.datos);
};

export const postMotivoTarea: PostMotivoTarea = async (motivoTarea) => {
    const respuesta = await RestAPI.post<NuevoMotivoTarea>(
        baseUrl,
        motivoTarea,
        "Error al crear motivo de tarea"
    );

    return respuesta.id.toString();
};

export const patchMotivoTarea: PatchMotivoTarea = async (id, motivoTarea) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        {
            cambios: {
                descripcion: motivoTarea.descripcion,
                activo: motivoTarea.activo,
            },
        },
        "Error al guardar motivo de tarea"
    );
};

export const deleteMotivoTarea = async (id: string): Promise<void> => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        "Error al borrar motivo de tarea"
    );
};
