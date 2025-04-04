import { Entidad } from "../../comun/diseño.ts";

export interface Cliente extends Entidad {
  id: string;
  nombre: string;
  nombre_comercial: string | null;
  id_fiscal: string;
  agente_id: string | null;
  nombre_agente: string | null;
  divisa_id: string;
  tipo_id_fiscal: string;
  serie_id: string;
  forma_pago_id: string;
  grupo_iva_negocio_id: string;
};

export interface IdFiscal {
  id_fiscal: string;
  tipo_id_fiscal: string;
}

export type NuevoCliente = {
  nombre: string;
  id_fiscal: string;
  empresa_id: string;
  tipo_id_fiscal: string;
  agente_id: string;
  divisa_id: string;
  serie_id: string;
  forma_pago_id: string;
  grupo_iva_negocio_id: string;
};

export type DirCliente = {
  id: string;
  dir_envio: boolean;
  dir_facturacion: boolean;
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

export type NuevaDireccion = {
  nombre_via: string;
  tipo_via: string;
  ciudad: string;
};


export type GetCliente = (id: string) => Promise<Cliente>;
export type PostCliente = (cliente: NuevoCliente) => Promise<string>;
export type PatchCliente = (id: string, cliente: Cliente) => Promise<void>;
