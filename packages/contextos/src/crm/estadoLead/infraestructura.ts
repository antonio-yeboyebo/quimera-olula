import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { DeleteEstadoLead, EstadoLead, GetEstadoLead, GetEstadosLead, PatchEstadoLead, PostEstadoLead } from "./diseño.ts";
import { tCrm } from "../i18n/index.ts";

const baseUrlEstadoLead = `/crm/estado_lead`;

export interface EstadoLeadAPI {
    id: string;
    descripcion: string;
    valor_defecto: boolean;
}

export const estadoLeadDesdeAPI = (api: EstadoLeadAPI): EstadoLead => ({
    id: api.id,
    descripcion: api.descripcion,
    valorDefecto: api.valor_defecto,
});

// El endpoint de escritura espera la clave "valordefecto" (sin guion bajo),
// distinta de "valor_defecto" que devuelve la lectura.
export const estadoLeadToAPI = (e: Partial<EstadoLead>) => {
    const { valorDefecto, ...rest } = e;
    return {
        ...rest,
        valordefecto: valorDefecto,
    };
};

export const getEstadoLead: GetEstadoLead = async (id) =>
    await RestAPI.get<{ datos: EstadoLeadAPI }>(`${baseUrlEstadoLead}/${id}`).then((respuesta) => estadoLeadDesdeAPI(respuesta.datos));


export const getEstadosLead: GetEstadosLead = async (filtro, orden, paginacion) => {
    const q = criteriaQuery(filtro, orden, paginacion);

    const respuesta = await RestAPI.get<{ datos: EstadoLeadAPI[]; total: number }>(baseUrlEstadoLead + q);
    return { datos: respuesta.datos.map(estadoLeadDesdeAPI), total: respuesta.total };
};

export const postEstadoLead: PostEstadoLead = async (estado) => {
    const payload = estadoLeadToAPI(estado);
    return await RestAPI.post(baseUrlEstadoLead, payload, tCrm("estadoLead.errorAlGuardarElEstadoDe")).then((respuesta) => respuesta.id);
};

export const patchEstadoLead: PatchEstadoLead = async (id, estado) => {
    const payload = estadoLeadToAPI(estado);
    await RestAPI.patch(`${baseUrlEstadoLead}/${id}`, payload, tCrm("estadoLead.errorAlGuardarElEstadoDe"));
};

export const deleteEstadoLead: DeleteEstadoLead = async (id) =>
    await RestAPI.delete(`${baseUrlEstadoLead}/${id}`, tCrm("estadoLead.errorAlBorrarElEstadoDe"));

export const marcarPorDefectoEstadoLead = async (id: string): Promise<void> => await RestAPI.patch(`${baseUrlEstadoLead}/${id}/pordefecto`, {}, tCrm("estadoLead.errorAlMarcarPorDefectoEl"));
