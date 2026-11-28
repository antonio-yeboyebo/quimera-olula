import { CrmContacto, NuevoCrmContacto } from "#/ventas/cliente/diseño.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { tComun } from "../i18n/index.ts";

/**
 * Agenda de contactos de un tercero (cliente o proveedor). Los contactos son los mismos
 * (crm_contactos); cada agenda los vincula en su tabla (contactosclientes,
 * contactosproveedores) y tiene sus rutas y su regla (ventas.contacto, compras.contacto).
 */
export interface ApiAgenda {
  cargar: (entidadId: string) => Promise<CrmContacto[]>;
  crear: (entidadId: string, contacto: NuevoCrmContacto) => Promise<string>;
  cambiar: (contacto: CrmContacto) => Promise<void>;
  borrar: (contactoId: string) => Promise<void>;
  vincular: (contactoId: string, entidadId: string) => Promise<void>;
  desvincular: (contactoId: string, entidadId: string) => Promise<void>;
  /** Busca en todos los contactos (para añadir uno existente a la agenda). */
  buscar: (filtro: Filtro, orden: Orden) => Promise<CrmContacto[]>;
}

export interface ContactoAgendaApi {
  id: string;
  nombre: string;
  cargo: string | null;
  email: string | null;
  telefono1: string | null;
  telefono2: string | null;
  observaciones: string | null;
}

export const contactoAgendaDesdeApi = (api: ContactoAgendaApi): CrmContacto => ({
  id: api.id,
  nombre: api.nombre ?? "",
  cargo: api.cargo ?? "",
  email: api.email ?? "",
  telefono1: api.telefono1 ?? "",
  telefono2: api.telefono2 ?? "",
  observaciones: api.observaciones ?? "",
});

export const contactoAgendaAApi = (contacto: NuevoCrmContacto) => ({
  nombre: contacto.nombre,
  cargo: contacto.cargo,
  email: contacto.email,
  telefono1: contacto.telefono1,
  telefono2: contacto.telefono2,
  observaciones: contacto.observaciones,
});

/**
 * @param urlAgenda ruta de la agenda de un tercero (p. ej. `/ventas/cliente/<id>/contacto`).
 * @param urlContactos ruta de los contactos con la regla de esa agenda (p. ej. `/ventas/contacto`).
 */
export const crearApiAgenda = (urlAgenda: (entidadId: string) => string, urlContactos: string): ApiAgenda => ({
  cargar: async (entidadId) =>
    RestAPI.get<{ datos: ContactoAgendaApi[] }>(urlAgenda(entidadId))
      .then((respuesta) => respuesta.datos.map(contactoAgendaDesdeApi)),

  crear: async (entidadId, contacto) =>
    RestAPI.post(urlAgenda(entidadId), contactoAgendaAApi(contacto), tComun("agenda.errorAlCrearContacto"))
      .then((respuesta) => respuesta.id),

  cambiar: async (contacto) => {
    await RestAPI.patch(`${urlContactos}/${contacto.id}`, contactoAgendaAApi(contacto), tComun("agenda.errorAlActualizarContacto"));
  },

  borrar: async (contactoId) => {
    await RestAPI.delete(`${urlContactos}/${contactoId}`, tComun("agenda.errorAlBorrarContacto"));
  },

  vincular: async (contactoId, entidadId) => {
    try {
      await RestAPI.post(`${urlAgenda(entidadId)}/${contactoId}`, {}, tComun("agenda.errorAlAnadirElContactoA"));
    } catch (error) {
      const fallo = error as { estado?: number; descripcion?: string };
      if (fallo?.estado === 409) {
        throw { nombre: "Contacto ya vinculado", descripcion: fallo.descripcion, estado: 409 };
      }
      throw error;
    }
  },

  desvincular: async (contactoId, entidadId) => {
    await RestAPI.delete(`${urlAgenda(entidadId)}/${contactoId}`, tComun("agenda.errorAlQuitarElContactoDe"));
  },

  buscar: async (filtro, orden) =>
    RestAPI.get<{ datos: ContactoAgendaApi[] }>(urlContactos + criteriaQuery(filtro, orden))
      .then((respuesta) => respuesta.datos.map(contactoAgendaDesdeApi)),
});
