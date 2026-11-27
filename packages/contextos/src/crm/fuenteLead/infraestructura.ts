import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { DeleteFuenteLead, FuenteLead, GetFuenteLead, GetFuentesLead, PatchFuenteLead, PostFuenteLead } from "./diseño.ts";
import { tCrm } from "../i18n/index.ts";

const baseUrlFuenteLead = `/crm/fuente_lead`;

export interface FuenteLeadAPI {
    id: string;
    descripcion: string;
    valor_defecto: boolean;
}

export const fuenteLeadDesdeAPI = (api: FuenteLeadAPI): FuenteLead => ({
    id: api.id,
    descripcion: api.descripcion,
    valorDefecto: api.valor_defecto,
});

// El endpoint de escritura espera la clave "valordefecto" (sin guion bajo),
// distinta de "valor_defecto" que devuelve la lectura.
export const fuenteLeadToAPI = (f: Partial<FuenteLead>) => {
    const { valorDefecto, ...rest } = f;
    return {
        ...rest,
        valordefecto: valorDefecto,
    };
};

export const getFuenteLead: GetFuenteLead = async (id) =>
    await RestAPI.get<{ datos: FuenteLeadAPI }>(`${baseUrlFuenteLead}/${id}`).then((respuesta) => fuenteLeadDesdeAPI(respuesta.datos));


export const getFuentesLead: GetFuentesLead = async (filtro, orden, paginacion) => {
    const q = criteriaQuery(filtro, orden, paginacion);

    const respuesta = await RestAPI.get<{ datos: FuenteLeadAPI[]; total: number }>(baseUrlFuenteLead + q);
    return { datos: respuesta.datos.map(fuenteLeadDesdeAPI), total: respuesta.total };
};

export const postFuenteLead: PostFuenteLead = async (fuente) => {
    const payload = fuenteLeadToAPI(fuente);
    return await RestAPI.post(baseUrlFuenteLead, payload, tCrm("fuenteLead.errorAlGuardarLaFuenteDe")).then((respuesta) => respuesta.id);
};

export const patchFuenteLead: PatchFuenteLead = async (id, fuente) => {
    const payload = fuenteLeadToAPI(fuente);
    await RestAPI.patch(`${baseUrlFuenteLead}/${id}`, payload, tCrm("fuenteLead.errorAlGuardarLaFuenteDe"));
};

export const deleteFuenteLead: DeleteFuenteLead = async (id) =>
    await RestAPI.delete(`${baseUrlFuenteLead}/${id}`, tCrm("fuenteLead.errorAlBorrarLaFuenteDe"));

export const marcarPorDefectoFuenteLead = async (id: string): Promise<void> => await RestAPI.patch(`${baseUrlFuenteLead}/${id}/pordefecto`, {}, tCrm("fuenteLead.errorAlMarcarPorDefectoLa"));
