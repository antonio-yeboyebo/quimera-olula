import { TipoProducto } from "../nueva_tarea/diseño.ts";

export type OrigenTrato = "mkt" | "farma" | "campaña" | null;

export type EstadoTratoFiltro = "abiertos" | "ganados" | "perdidos" | "todos";

export type TratoLista = {
    id: string;
    titulo: string;
    cliente: string | null;
    contacto: string | null;
    valor: number;
    estado: string;
    fecha: string | null;
    origen: OrigenTrato;
};

export type TratoListaAPI = {
    idtrato: number;
    titulo: string;
    nombrecliente: string | null;
    nombrecontacto: string | null;
    valor: number | null;
    estado: string;
    fecha: string | null;
    idcampania: number | null;
    idtipotrato: number | null;
    cuentamarketing: string | null;
};

export type FiltrosTratos = {
    agente: string | null;
    estado: EstadoTratoFiltro;
    titulo: string;
    contacto: string;
    codCliente: string;
    cifNif: string;
    desde: string;
    hasta: string;
};

export type TotalesTratos = {
    abiertos: number;
    ganados: number;
    perdidos: number;
};

export type TipoTrato = {
    id: string;
    descripcion: string;
};

export type FamiliaTrato = {
    codfamilia: string;
    descripcion: string;
};

export type FormularioTrato = {
    titulo: string;
    cliente: { codigo: string; nombre: string } | null;
    idTipoTrato: string | null;
    valor: number;
    familias: FamiliaTrato[];
    producto: { tipo: TipoProducto; codigo: string; descripcion: string } | null;
};

export type NuevoTratoAPI = {
    titulo: string;
    codcliente: string;
    idtipotrato: number | null;
    valor: number;
    familias: string;
    referencia: string | null;
    codfamilia: string | null;
    codsubfamilia: string | null;
};
