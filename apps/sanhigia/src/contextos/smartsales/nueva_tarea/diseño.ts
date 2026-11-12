import { TipoTarea } from "../comun/diseño.ts";

export type TipoProducto = "articulo" | "familia" | "subfamilia";

export type Producto = {
    tipo: TipoProducto;
    codigo: string;
    descripcion: string;
};

export type ClienteElegido = {
    codigo: string;
    nombre: string;
};

export type TratoCliente = {
    id: string;
    titulo: string;
};

export type Motivo = {
    id: string;
    descripcion: string;
};

export type Sugerencia = {
    codSubfamilia: string;
    descripcion: string;
    score: number;
};

export type FormularioTarea = {
    cliente: ClienteElegido | null;
    idTrato: string | null;
    tipo: TipoTarea;
    fecha: string;
    hora: string;
    idMotivo: string | null;
    producto: Producto | null;
    nota: string;
};

export type NuevaTareaAPI = {
    titulo: string;
    fecha: string;
    hora: string;
    tipo: TipoTarea;
    nota: string;
    idmotivo: number | null;
    referencia: string | null;
    codfamilia: string | null;
    codsubfamilia: string | null;
};
