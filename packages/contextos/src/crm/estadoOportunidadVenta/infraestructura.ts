import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import {
    DeleteEstadoOportunidad,
    EstadoOportunidad,
    GetEstadoOportunidad,
    GetEstadosOportunidad,
    PatchEstadoOportunidad,
    PostEstadoOportunidad,
} from "./diseño.ts";
import { tCrm } from "../i18n/index.ts";

const baseUrlEstadoOportunidadVenta = `/crm/estado_oportunidad_venta`;

export interface EstadoOportunidadAPI {
    id: string;
    estadobase: string;
    descripcion: string;
    probabilidad: number;
    valor_defecto: boolean;
}

export const estadoOportunidadDesdeAPI = (api: EstadoOportunidadAPI): EstadoOportunidad => ({
    id: api.id,
    estadobase: api.estadobase,
    descripcion: api.descripcion,
    probabilidad: api.probabilidad,
    valorDefecto: api.valor_defecto,
});

// El endpoint de escritura espera la clave "valordefecto" (sin guion bajo),
// distinta de "valor_defecto" que devuelve la lectura.
export const estadoOportunidadToAPI = (e: Partial<EstadoOportunidad>) => {
    const { valorDefecto, ...rest } = e;
    return {
        ...rest,
        valordefecto: valorDefecto,
    };
};

export const getEstadoOportunidad: GetEstadoOportunidad = async (id) =>
    await RestAPI.get<{ datos: EstadoOportunidadAPI }>(`${baseUrlEstadoOportunidadVenta}/${id}`).then((respuesta) => estadoOportunidadDesdeAPI(respuesta.datos));


export const getEstadosOportunidad: GetEstadosOportunidad = async (filtro, orden, paginacion) => {
    const q = criteriaQuery(filtro, orden, paginacion);

    const respuesta = await RestAPI.get<{ datos: EstadoOportunidadAPI[]; total: number }>(baseUrlEstadoOportunidadVenta + q);
    return { datos: respuesta.datos.map(estadoOportunidadDesdeAPI), total: respuesta.total };
};

export const postEstadoOportunidad: PostEstadoOportunidad = async (estado) => {
    const payload = estadoOportunidadToAPI(estado);
    return await RestAPI.post(baseUrlEstadoOportunidadVenta, payload, tCrm("estadoOportunidadVenta.errorAlGuardarElEstadoDe")).then((respuesta) => respuesta.id);
};

export const patchEstadoOportunidad: PatchEstadoOportunidad = async (id, estado) => {
    const payload = estadoOportunidadToAPI(estado);
    await RestAPI.patch(`${baseUrlEstadoOportunidadVenta}/${id}`, payload, tCrm("estadoOportunidadVenta.errorAlGuardarElEstadoDe"));
};

export const deleteEstadoOportunidad: DeleteEstadoOportunidad = async (id) =>
    await RestAPI.delete(`${baseUrlEstadoOportunidadVenta}/${id}`, tCrm("estadoOportunidadVenta.errorAlBorrarElEstadoDe"));

export const marcarPorDefectoEstadoOportunidad = async (id: string): Promise<void> => await RestAPI.patch(`${baseUrlEstadoOportunidadVenta}/${id}/pordefecto`, {}, tCrm("estadoOportunidadVenta.errorAlMarcarPorDefectoEl"));
