import { ArticuloElegido } from "../comun/componentes/ListaArticulos.tsx";

export type Capital = {
    nombre: string;
    latitud: number;
    longitud: number;
};

export type OrdenClientes = "distancia" | "afinidad";

export type FiltrosProspeccion = {
    capital: string | null;
    radio: number;
    afinidadMin: number | null;
    sinCompraMeses: number | null;
    ventasMin: number | null;
    subfamilia: ArticuloElegido | null;
    articulos: ArticuloElegido[];
    orden: OrdenClientes;
};

export type ClienteMapa = {
    codCliente: string;
    nombre: string;
    direccion: string;
    codPostal: string | null;
    ciudad: string | null;
    latitud: number;
    longitud: number;
    distancia: number;
    afinidad: number | null;
    ultimaCompra: string | null;
    ventas12Meses: number | null;
};

export type ClienteMapaAPI = {
    codcliente: string;
    nombre: string;
    direccion: string;
    codpostal: string | null;
    ciudad: string | null;
    latitud: number;
    longitud: number;
    distancia: number;
    afinidad: number | null;
    ultimacompra: string | null;
    ventas12meses: number | null;
};

export type ResultadoMapa = {
    total: number;
    clientes: ClienteMapa[];
};
