import UrlsVentasClass from "#/ventas/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { QError } from "@olula/lib/contexto.ts";
import { Criteria, Filtro, Orden, RespuestaLista } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { criteriaQuery, criteriaQueryUrl } from "@olula/lib/infraestructura.ts";
import { AccionAPI, accionDesdeAPI } from "../accion/infraestructura.ts";
import UrlsCrmClass from "../comun/urls.ts";
import { NuevaOportunidadVenta } from "../oportunidadventa/crear/diseño.ts";
import { OportunidadVenta } from "../oportunidadventa/diseño.ts";
import { oportunidadDesdeAPI, OportunidadVentaAPI } from "../oportunidadventa/infraestructura.ts";
import { Cliente, DeleteCliente, GetCliente, GetClientes, PatchCliente } from "./diseño.ts";
import { tCrm } from "../i18n/index.ts";

const UrlsCrm = new UrlsCrmClass();
const UrlsVentas = new UrlsVentasClass();

const criteriaOportunidadesRelacionadasDefecto: Criteria = {
  ...criteriaDefecto,
  orden: ["probabilidad", "DESC"],
};

export type ClienteApi = Cliente;

const clienteFromAPI = (c: ClienteApi): Cliente => ({
  ...c,
});

export const getCliente: GetCliente = async (id) =>
  await RestAPI.get<{ datos: Cliente }>(`${UrlsVentas.CLIENTE}/${id}`).then((respuesta) => clienteFromAPI(respuesta.datos));

export const getClientes: GetClientes = async (filtro, orden, paginacion) => {
  const q = criteriaQuery(filtro, orden, paginacion);

  const respuesta = await RestAPI.get<{ datos: ClienteApi[]; total: number }>(UrlsVentas.CLIENTE + q);
  return { datos: respuesta.datos.map(clienteFromAPI), total: respuesta.total };
};

export const patchCliente: PatchCliente = async (id, cliente) =>
  await RestAPI.patch(`${UrlsVentas.CLIENTE}/${id}`, {
    cambios: {
      nombre: cliente.nombre,
      id_fiscal: {
        id: cliente.id_fiscal,
        tipo: cliente.tipo_id_fiscal,
      },
      grupo_iva_negocio_id: cliente.grupo_iva_negocio_id,
      nombre_comercial: cliente.nombre_comercial,
      web: cliente.web,
      telefono1: cliente.telefono1,
      telefono2: cliente.telefono2,
      email: cliente.email,
      observaciones: cliente.observaciones,
      grupo_id: cliente.grupo_id,
    },
  }, tCrm("cliente.errorAlGuardarCliente"));

export const deleteCliente: DeleteCliente = async (id) =>
  await RestAPI.delete(`${UrlsVentas.CLIENTE}/${id}`, tCrm("cliente.errorAlBorrarCliente"));

export const getOportunidadesVentaCliente = async (
  clienteId: string,
  criteria: Criteria = criteriaOportunidadesRelacionadasDefecto
): RespuestaLista<OportunidadVenta> =>
  await RestAPI
    .get<{ datos: OportunidadVentaAPI[]; total: number }>(
      `${UrlsCrm.CLIENTE}/${clienteId}/oportunidades_venta${criteriaQuery(
        criteria.filtro,
        criteria.orden,
        criteria.paginacion
      )}`
    )
    .then((respuesta) => ({
      ...respuesta,
      datos: respuesta.datos.map(oportunidadDesdeAPI),
    }));

export const getOportunidadVenta = async (id: string): Promise<OportunidadVenta> =>
  await RestAPI.get<{ datos: OportunidadVenta }>(`${UrlsCrm.OPORTUNIDAD_VENTA}/${id}`).then((respuesta) => respuesta.datos);

export const postOportunidadVenta = async (oportunidad: NuevaOportunidadVenta): Promise<string> => {
  return await RestAPI.post(UrlsCrm.OPORTUNIDAD_VENTA, oportunidad).then((respuesta) => respuesta.id);
};

export const vincularContactoCliente = async (contactoId: string, clienteId: string): Promise<void> => {
  const payload = {
    contacto_id: contactoId,
  };
  try {
    await RestAPI.patch(`${UrlsCrm.CLIENTE}/${clienteId}/vincular_contacto`, payload, tCrm("cliente.errorAlVincularContacto"));
  } catch (error) {
    const fallo = error as QError;
    if (fallo?.estado === 409) {
      throw { nombre: "Contacto ya vinculado", descripcion: fallo.descripcion, estado: 409 };
    }
    throw error;
  }
};

export const desvincularContactoCliente = async (contactoId: string, clienteId: string): Promise<void> => {
  const payload = {
    contacto_id: contactoId,
  };
  await RestAPI.patch(`${UrlsCrm.CLIENTE}/${clienteId}/desvincular_contacto`, payload, tCrm("cliente.errorAlDesvincularContacto"));
};

export const getAccionesCliente = async (clienteId: string) => {
  const filtro = ['cliente_id', clienteId] as unknown as Filtro;
  const orden = [] as Orden;
  const q = criteriaQueryUrl(filtro, orden);
  return RestAPI
    .get<{ datos: AccionAPI[]; total: number }>(UrlsCrm.ACCION + q)
    .then((respuesta) => ({
      ...respuesta,
      datos: respuesta.datos.map(accionDesdeAPI),
    }));
};