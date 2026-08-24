import { Criteria, Entidad, RespuestaLista } from "@olula/lib/diseño.ts";

export type EstadoComponente = "Pendiente" | "En Curso" | "Listo";
export type EstadoFase = "Pendiente" | "Pedido" | "Recibido";
export type RutaComponente = "Defecto" | "Proveedor";

export interface FaseMaquina extends Entidad {
    id: string;
    codigo: string;
    observaciones: string;
    proveedor: string;
    estado: EstadoFase;
    numDoc?: string;
}

export interface ComponenteMaquina extends Entidad {
    id: string;
    orden: number;
    cantidad: number;
    referencia: string;
    descripcion: string;
    estado: EstadoComponente;
    ruta: RutaComponente;
    componentes: ComponenteMaquina[];
    fases: FaseMaquina[];
}

export interface Maquina extends Entidad {
    id: string;
    referencia: string;
    descripcion: string;
    cliente: string;
    codigoPedido: string;
    fecha: string;
    componentes: ComponenteMaquina[];
}

export interface ItemMaquina extends Entidad {
    id: string;
    referencia: string;
    descripcion: string;
    cliente: string;
    codigoPedido: string;
    fecha: string;
}

export type GetMaquinas = (criteria: Criteria) => RespuestaLista<ItemMaquina>;
export type GetMaquina = (id: string) => Promise<Maquina>;
