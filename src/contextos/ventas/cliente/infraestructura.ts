import { CampoFormularioGenerico, OpcionCampo } from "../../../componentes/detalle/FormularioGenerico.tsx";
import { RestAPI } from "../../comun/api/rest_api.ts";
import { Filtro, Orden } from "../../comun/diseño.ts";
import { Cliente, DirCliente, GetCliente, NuevaDireccion, PatchCliente, PostCliente } from "./diseño.ts";

const baseUrl = `/ventas/cliente`;

type ClienteApi = Cliente;

const clienteFromAPI = (c: ClienteApi): Cliente => c;

export type DireccionAPI = {
  nombre_via: string;
  tipo_via: string;
  numero: string;
  otros: string;
  cod_postal: string;
  ciudad: string;
  provincia_id: number;
  provincia: string;
  pais_id: string;
  apartado: string;
  telefono: string;
};

export type DirClienteAPI = {
  id: string;
  direccion: DireccionAPI;
  dir_envio: boolean;
  dir_facturacion: boolean;
};

const dirClienteFromAPI = (d: DirClienteAPI): DirCliente => (
  {
    id: d.id,
    dir_facturacion: d.dir_facturacion,
    dir_envio: d.dir_envio,
    ...d.direccion,
  }
)

const dirClienteToAPI = (d: DirCliente): DireccionAPI => (
  {
    nombre_via: d.nombre_via,
    tipo_via: d.tipo_via,
    numero: d.numero,
    otros: d.otros,
    cod_postal: d.cod_postal,
    ciudad: d.ciudad,
    provincia_id: d.provincia_id,
    provincia: d.provincia,
    pais_id: d.pais_id,
    apartado: d.apartado,
    telefono: d.telefono,
  }
)

export const getCliente: GetCliente = async (id) =>
  await RestAPI.get<{ datos: Cliente }>(`${baseUrl}/${id}`).then((respuesta) => clienteFromAPI(respuesta.datos));

export const getClientes = async (filtro: Filtro, orden: Orden): Promise<Cliente[]> => {
  const q = filtro || orden ? "?q=" + btoa(JSON.stringify({ filtro, orden })) : "";

  return RestAPI.get<{ datos: ClienteApi[] }>(baseUrl + q).then((respuesta) => respuesta.datos.map(clienteFromAPI));
}

export const patchCliente: PatchCliente = async (id, cliente) =>
  await RestAPI.patch(`${baseUrl}/${id}`, {
    nombre: cliente.nombre,
    id_fiscal: cliente.id_fiscal,
  });

export const deleteCliente = async (id: string): Promise<void> =>
  await RestAPI.delete(`${baseUrl}/${id}`);

export const postCliente: PostCliente = async (cliente) => {
  const payload = {
    cliente: {
      ...cliente,
    }
  }
  return await RestAPI.post(baseUrl, payload).then((respuesta) => respuesta.id);
}

export const getDireccion = async (clienteId: string, direccionId: string): Promise<DirCliente> =>
  await RestAPI.get<{ datos: DirClienteAPI }>(`${baseUrl}/${clienteId}/direccion/${direccionId}`).then((respuesta) =>
    dirClienteFromAPI(respuesta.datos)
  );

export const getDirecciones = async (id: string): Promise<DirCliente[]> =>
  await RestAPI.get<{ datos: DirClienteAPI[] }>(`${baseUrl}/${id}/direccion`).then((respuesta) => {
    const direcciones = respuesta.datos.map((d) => dirClienteFromAPI(d));
    return direcciones
  });

export const postDireccion = async (clienteId: string, direccion: NuevaDireccion): Promise<string> => {
  const payload = {
    direccion: {
      ...direccion,
    }
  }
  return await RestAPI.post(`${baseUrl}/${clienteId}/direccion`, payload).then((respuesta) => respuesta.id);
}

export const setDirFacturacion = async (clienteId: string, direccionId: string): Promise<void> =>
  RestAPI.patch(`${baseUrl}/${clienteId}/direccion/${direccionId}/facturacion`, {});


export const actualizarDireccion = async (clienteId: string, direccion: DirCliente): Promise<void> =>
  RestAPI.patch(
    `${baseUrl}/${clienteId}/direccion/${direccion.id}`
    , { direccion: dirClienteToAPI(direccion) }
  );

export const deleteDireccion = async (clienteId: string, direccionId: string): Promise<void> =>
  await RestAPI.delete(`${baseUrl}/${clienteId}/direccion/${direccionId}`);


export const obtenerOpcionesSelector =
  (path: string) => async () =>
    RestAPI.get<{ datos: [] }>(
      `/cache/comun/${path}`
    ).then((respuesta) => respuesta.datos.map(({ descripcion, ...resto }: Record<string, string>) => [Object.values(resto).at(0), descripcion] as OpcionCampo));

const opcionesDivisa = await obtenerOpcionesSelector("divisa")();

export const camposDireccion: Record<string, CampoFormularioGenerico> = {
  id: { nombre: "id", etiqueta: "ID", tipo: "text", oculto: true },
  nombre_via: { nombre: "nombre_via", etiqueta: "Nombre de la Vía", tipo: "text", xtipo: "no controlado" },
  tipo_via: { nombre: "tipo_via", etiqueta: "Tipo de Vía", tipo: "text" },
  numero: { nombre: "numero", etiqueta: "Número", tipo: "text" },
  otros: { nombre: "otros", etiqueta: "Otros", tipo: "text" },
  cod_postal: { nombre: "cod_postal", etiqueta: "Código Postal", tipo: "text" },
  ciudad: { nombre: "ciudad", etiqueta: "Ciudad", tipo: "text" },
  provincia_id: { nombre: "provincia_id", etiqueta: "ID de Provincia", tipo: "number" },
  provincia: { nombre: "provincia", etiqueta: "Provincia", tipo: "text" },
  pais_id: { nombre: "pais_id", etiqueta: "ID de País", tipo: "text" },
  apartado: { nombre: "apartado", etiqueta: "Apartado", tipo: "text" },
  telefono: { nombre: "telefono", etiqueta: "Teléfono", tipo: "text" },
}

export const camposCliente: Record<string, CampoFormularioGenerico> = {
  id: { nombre: "id", etiqueta: "Código", tipo: "text", oculto: true },
  nombre: { nombre: "nombre", etiqueta: "Nombre", tipo: "text", ancho: "100%", xtipo: "no controlado", },
  id_fiscal: {
    nombre: "id_fiscal", etiqueta: "CIF/NIF", tipo: "text", xtipo: "controlado"
  },
  agente_id: { nombre: "agente_id", etiqueta: "Agente", tipo: "text" },
  divisa_id: {
    nombre: "divisa_id",
    etiqueta: "Divisa",
    tipo: "select",
    opciones: opcionesDivisa,
  },
  empresa_id: { nombre: "empresa_id", etiqueta: "Empresa", tipo: "text" },
  tipo_id_fiscal: {
    nombre: "tipo_id_fiscal", etiqueta: "Tipo ID Fiscal", tipo: "text", xtipo: "controlado", opciones: [
      ["NIF", "NIF"],
      ["NIF/IVA", "NIF/IVA"],
      ["Pasaporte", "Pasaporte"],
      ["Doc.Oficial País", "Doc.Oficial País"],
      ["Cert.Residencia", "Cert.Residencia"],
      ["Otro", "Otro"],
    ]
  },
  serie_id: { nombre: "serie_id", etiqueta: "Serie", tipo: "text", soloLectura: true },
  forma_pago_id: { nombre: "forma_pago_id", etiqueta: "Forma de Pago", tipo: "text" },
  grupo_iva_negocio_id: { nombre: "grupo_iva_negocio_id", etiqueta: "Grupo IVA Negocio", tipo: "text" },
  eventos: { nombre: "eventos", etiqueta: "Eventos", tipo: "text", oculto: true },
  espacio: { nombre: "espacio", etiqueta: "", tipo: "space" },
}
