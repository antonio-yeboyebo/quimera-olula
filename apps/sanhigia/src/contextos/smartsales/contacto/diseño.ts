export type Contacto = {
    codigo: string;
    nombre: string;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    ciudad: string | null;
    codPostal: string | null;
    codCliente: string | null;
    enLista: boolean;
    datosRevisados: boolean;
};

export type ContactoAPI = {
    codcontacto: string;
    nombre: string;
    email: string | null;
    telefono1: string | null;
    direccion: string | null;
    ciudad?: string | null;
    codpostal: string | null;
    codcliente?: string | null;
    enlista: string | boolean | null;
    datosrevisados?: boolean | null;
};

export type ClienteContacto = {
    codigo: string;
    nombre: string;
};

export type FormularioContacto = {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    codPostal: string;
    cliente: ClienteContacto | null;
};

export type CambiosContactoAPI = Partial<{
    nombre: string;
    email: string;
    telefono1: string | null;
    direccion: string | null;
    ciudad: string | null;
    codpostal: string | null;
    codcliente: string | null;
    idcompany: number | null;
    datosrevisados: boolean;
}>;

export type EstadoEmail = "vacio" | "invalido" | "comprobando" | "libre" | "existe";

export type TratoContacto = {
    id: string;
    titulo: string;
    estado: string;
    valor: number;
    fecha: string | null;
    codAgente: string | null;
};

export type EventoContacto = {
    codigo: string;
    nombre: string;
    fecha: string | null;
};

export type NotaContacto = {
    id: string;
    texto: string;
    fecha: string;
};
