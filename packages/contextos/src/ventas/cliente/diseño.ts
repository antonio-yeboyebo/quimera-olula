import { Direccion, Entidad } from "@olula/lib/diseño.ts";

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
  de_baja: boolean;
  fecha_baja: Date | null;
  grupo_id: string;
  telefono1: string;
  telefono2: string;
  email: string;
  web: string;
  observaciones: string;
  copiasfactura: number;
  contacto_id: string;
  cuenta_domiciliada: string;
  descripcion_cuenta: string;
  cuenta_remesa: string;
  descripcion_cuenta_remesa: string;
  forma_pago: string;
  divisa: string;
  serie: string;
  grupo: string;
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
  direccion?: NuevaDireccion;
};

export interface DirCliente extends Direccion {
  id: string;
  dir_envio: boolean;
  dir_facturacion: boolean;
};

export type NuevaDireccion = {
  nombre_via: string;
  tipo_via: string;
  numero: string;
  otros: string;
  cod_postal: string;
  ciudad: string;
  provincia: string;
  pais_id: string;
  apartado: string;
  telefono: string;
};

export type FormBaja = {
  fecha_baja: Date | null;
}

export interface CuentaBanco extends Entidad {
  id: string;
  descripcion: string;
  iban: string;
  bic: string;
  codigo_cuenta: string;
  pais_id: string;
  entidad: string;
  agencia: string;
  digito_control: string;
  cuenta: string;
};

export type NuevaCuentaBanco = {
  descripcion: string;
  iban: string;
};

export interface CrmContacto extends Entidad {
  id: string;
  nombre: string;
  email: string;
  telefono1: string;
};

export type NuevoCrmContacto = {
  nombre: string;
  email: string;
  telefono1: string;
};


export type GetCliente = (id: string) => Promise<Cliente>;
export type PostCliente = (cliente: NuevoCliente) => Promise<string>;
export type PatchCliente = (id: string, cliente: Cliente) => Promise<void>;