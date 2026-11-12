import { BloqueKpi, BloqueKpiAPI } from "../hoy/diseño.ts";

export type ObjetivosNuevosClientes = {
    nuevosClientes: BloqueKpi;
    unidades: BloqueKpi;
    familias: string[];
    subfamilias: string[];
};

export type ObjetivosAPI = {
    kpi_nuevos_clientes_familia: BloqueKpiAPI;
    kpi_unidades_producto: BloqueKpiAPI;
};

export type ClienteNuevo = {
    codCliente: string;
    nombre: string;
    importe: number;
};

export type LineaClientesNuevos = {
    clave: string;
    descripcion: string;
    clientes: ClienteNuevo[];
};

export type LineaClientesNuevosAPI = {
    codfamilia: string;
    codsubfamilia: string;
    descripcion: string | null;
    clientes: { codcliente: string; nombre: string; importe: number }[];
};

export type ClienteRecomendado = {
    codCliente: string;
    coddir: number;
    nombre: string;
    ciudad: string | null;
    score: number;
};

export type ClienteRecomendadoAPI = {
    codcliente: string;
    coddir: number;
    nombre: string;
    ciudad: string | null;
    score: number;
};

export type PaginaRecomendados = {
    clientes: ClienteRecomendado[];
    siguiente: [number, number] | null;
};
