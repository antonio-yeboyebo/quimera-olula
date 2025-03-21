import { Acciones, Entidad } from "../../comun/diseño.ts";
import { Direccion as DireccionCliente } from "../cliente/diseño.ts";

export type Direccion = DireccionCliente;

export interface Presupuesto extends Entidad {
  id: string;
  codigo: string;
  fecha: string;
  cliente_id: string;
  nombre_cliente: string;
  id_fiscal: string;
  direccion_id: string;
  direccion: Direccion;
};

export type LineaPresupuesto = {
  id: string;
  referencia: string;
  descripcion: string;
  cantidad: number;
  pvp_unitario: number;
  pvp_total: number;
};

export type AccionesLineaPresupuesto = Acciones<LineaPresupuesto> & {
  onCambiarCantidadLinea: (id: string, linea: LineaPresupuesto) => Promise<void>;
};
