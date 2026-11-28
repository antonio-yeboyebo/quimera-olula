import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria, Filtro, Orden, RespuestaLista } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { criteriaQuery, criteriaQueryUrl } from "@olula/lib/infraestructura.ts";
import { Accion } from "../accion/diseño.ts";
import { AccionAPI, accionDesdeAPI } from "../accion/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import { OportunidadVenta } from "../oportunidadventa/diseño.ts";
import {
    oportunidadDesdeAPI,
    OportunidadVentaAPI,
} from "../oportunidadventa/infraestructura.ts";
import {
    DeleteLead,
    GetLead,
    GetLeads,
    Lead,
    LeadAPI,
    LeadToAPI,
    PatchLead,
    PostLead,
} from "./diseño.ts";
import { tCrm } from "../i18n/index.ts";

const criteriaOportunidadesRelacionadasDefecto: Criteria = {
    ...criteriaDefecto,
    orden: ["probabilidad", "DESC"],
};

const combinarFiltroOportunidades = (
    leadId: string,
    filtro: Filtro
): Filtro => {
    const filtroRelacion = [["tarjeta_id", "=", leadId]] as unknown as Filtro;

    if (Array.isArray(filtro) && filtro.length === 0) {
        return filtroRelacion;
    }

    return { and: [filtroRelacion, filtro] };
};

export const leadFromAPI = (l: LeadAPI): Lead => ({
    ...l,
    direccion: l.direccion?.direccion ?? "",
    cod_postal: l.direccion?.cod_postal ?? null,
    ciudad: l.direccion?.ciudad ?? "",
    provincia_id: l.direccion?.provincia_id != null ? String(l.direccion.provincia_id) : null,
    provincia: l.direccion?.provincia ?? "",
    pais_id: l.direccion?.pais_id ?? "",
    pais: l.direccion?.pais ?? null,
    telefono_1: l.direccion?.telefono_1 ?? "",
    telefono_2: l.direccion?.telefono_2 ?? "",
    contacto: l.contacto
        ? {
            nombre: l.contacto.nombre ?? "",
        }
        : null,
});

export const leadToAPI = (l: Lead): LeadToAPI => {
    const {
        direccion,
        cod_postal,
        ciudad,
        provincia_id,
        provincia,
        pais_id,
        pais,
        telefono_1,
        ...rest
    } = l;
    return {
        ...rest,
        proveedor_id: (rest.proveedor_id ?? "") as string,
        direccion: {
            nombre_via: direccion ?? "",
            cod_postal: cod_postal ?? "",
            ciudad: ciudad ?? "",
            provincia_id: provincia_id ? String(provincia_id) : null,
            provincia: provincia ?? "",
            pais_id: pais_id ?? "",
            pais: pais ?? "",
            telefono: telefono_1 ?? "",
            tipo_via: "",
            numero: "",
            otros: "",
            apartado: "",
        },
    };
};

export const getLead: GetLead = async (id) =>
    await RestAPI.get<{ datos: LeadAPI }>(`${new ApiUrls().LEAD}/${id}`).then((respuesta) =>
        leadFromAPI(respuesta.datos)
    );

export const getLeads: GetLeads = async (filtro, orden, paginacion) => {
    const q = criteriaQuery(filtro, orden, paginacion);

    const respuesta = await RestAPI.get<{ datos: LeadAPI[]; total: number }>(new ApiUrls().LEAD + q);
    return { datos: respuesta.datos.map(leadFromAPI), total: respuesta.total };
};

export const postLead: PostLead = async (lead) => {
    return await RestAPI.post(new ApiUrls().LEAD, lead, tCrm("lead.errorAlGuardarLead")).then(
        (respuesta) => respuesta.id
    );
};

export const patchLead: PatchLead = async (id, lead) => {
    const apiLead = leadToAPI(lead as Lead);
    await RestAPI.patch(`${new ApiUrls().LEAD}/${id}`, apiLead, tCrm("lead.errorAlGuardarLead"));
};

export const deleteLead: DeleteLead = async (id) =>
    await RestAPI.delete(`${new ApiUrls().LEAD}/${id}`, tCrm("lead.errorAlBorrarLead"));

export const getOportunidadesVentaLead = async (
    leadId: string,
    criteria: Criteria = criteriaOportunidadesRelacionadasDefecto
): RespuestaLista<OportunidadVenta> => {
    const q = criteriaQuery(
        combinarFiltroOportunidades(leadId, criteria.filtro),
        criteria.orden,
        criteria.paginacion
    );
    return RestAPI
        .get<{ datos: OportunidadVentaAPI[], total: number }>(new ApiUrls().OPORTUNIDAD_VENTA + q)
        .then((respuesta) => ({
            ...respuesta,
            datos: respuesta.datos.map(oportunidadDesdeAPI),
        }));
};

export const getAccionesLead = async (leadId: string): RespuestaLista<Accion> => {
    const filtro = ['tarjeta_id', leadId] as unknown as Filtro;
    const orden = [] as Orden;

    const q = criteriaQueryUrl(filtro, orden);
    return RestAPI
        .get<{ datos: AccionAPI[], total: number }>(new ApiUrls().ACCION + q)
        .then((respuesta) => ({
            ...respuesta,
            datos: respuesta.datos.map(accionDesdeAPI),
        }));
};

