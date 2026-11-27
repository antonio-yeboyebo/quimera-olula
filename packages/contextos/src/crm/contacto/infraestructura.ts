import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria, Filtro, Orden } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { criteriaQuery, criteriaQueryUrl } from "@olula/lib/infraestructura.ts";
import { AccionAPI, accionDesdeAPI } from "../accion/infraestructura.ts";
import { Cliente } from "../cliente/diseño.ts";
import ApiUrls from "../comun/urls.ts";
import {
  oportunidadDesdeAPI,
  OportunidadVentaAPI,
} from "../oportunidadventa/infraestructura.ts";

import {
  Contacto,
  DeleteContacto,
  GetContacto,
  GetContactos,
  PatchContacto,
  PostContacto,
} from "./diseño.ts";
import { tCrm } from "../i18n/index.ts";


const baseUrlContactos = new ApiUrls().CONTACTO;
const baseUrlAccion = new ApiUrls().ACCION;
const baseUrlOportunidadVenta = new ApiUrls().OPORTUNIDAD_VENTA;

const criteriaOportunidadesRelacionadasDefecto: Criteria = {
  ...criteriaDefecto,
  orden: ["probabilidad", "DESC"],
};

const combinarFiltroOportunidades = (
  contactoId: string,
  filtro: Filtro
): Filtro => {
  const filtroRelacion = [["contacto_id", "=", contactoId]] as unknown as Filtro;

  if (Array.isArray(filtro) && filtro.length === 0) {
    return filtroRelacion;
  }

  return { and: [filtroRelacion, filtro] };
};

type ContactoApi = Contacto;

const contactoFromAPI = (c: ContactoApi): Contacto => ({
  ...c,
});

const contactoToAPI = (c: Contacto): ContactoApi => ({
  ...c,
});

export const getContacto: GetContacto = async (id) =>
  await RestAPI.get<{ datos: Contacto }>(`${baseUrlContactos}/${id}`).then((respuesta) => contactoFromAPI(respuesta.datos));

export const getContactos: GetContactos = async (filtro, orden, paginacion) => {
  const q = criteriaQuery(filtro, orden, paginacion);

  const respuesta = await RestAPI.get<{ datos: Contacto[]; total: number }>(baseUrlContactos + q);
  return { datos: respuesta.datos.map(contactoFromAPI), total: respuesta.total };
};

export const patchContacto: PatchContacto = async (id, contacto) =>
  await RestAPI.patch(`${baseUrlContactos}/${id}`, contacto, tCrm("contacto.errorAlGuardarContacto"));

export const postContacto: PostContacto = async (contacto) => {
  return await RestAPI.post(baseUrlContactos, contactoToAPI(contacto as Contacto), tCrm("contacto.errorAlGuardarContacto")).then(
    (respuesta) => respuesta.id
  );
};

export const deleteContacto: DeleteContacto = async (id) =>
  await RestAPI.delete(`${baseUrlContactos}/${id}`, tCrm("contacto.errorAlBorrarContacto"));


export const getOportunidadesVentaContacto = async (
  contactoId: string,
  criteria: Criteria = criteriaOportunidadesRelacionadasDefecto
) => {
  const q = criteriaQuery(
    combinarFiltroOportunidades(contactoId, criteria.filtro),
    criteria.orden,
    criteria.paginacion
  );
  return RestAPI
    .get<{ datos: OportunidadVentaAPI[]; total: number }>(
      baseUrlOportunidadVenta + q
    )
    .then((respuesta) => ({
      ...respuesta,
      datos: respuesta.datos.map(oportunidadDesdeAPI),
    }));
};

export const getClientesPorContacto = async (contactoId: string) =>
  await RestAPI.get<{ datos: Cliente[], total: number }>(`/crm/contacto/${contactoId}/clientes`).then((respuesta) => respuesta);

export const getAccionesContacto = async (contactoId: string) => {
  const filtro = ['contacto_id', contactoId] as unknown as Filtro;

  const orden = [] as Orden;

  const q = criteriaQueryUrl(filtro, orden);
  return RestAPI
    .get<{ datos: AccionAPI[]; total: number }>(baseUrlAccion + q)
    .then((respuesta) => ({
      ...respuesta,
      datos: respuesta.datos.map(accionDesdeAPI),
    }));
};
