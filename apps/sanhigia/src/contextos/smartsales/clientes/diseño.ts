export type ClienteLista = {
    codigo: string;
    nombre: string;
    activo: boolean;
};

export type ContactoLista = {
    codigo: string;
    nombre: string;
    email: string | null;
    telefono: string | null;
    codCliente: string | null;
    numTratos: number;
};

export type DireccionCliente = {
    direccion: string;
    codPostal: string | null;
    ciudad: string | null;
    provincia: string | null;
    latitud: number | null;
    longitud: number | null;
};

export type ResumenCliente = {
    codigo: string;
    nombre: string;
    telefono: string | null;
    email: string | null;
    direccion: DireccionCliente | null;
    activo: boolean;
    clienteDesde: string | null;
    ventas12Meses: number | null;
    tratosAbiertos: number;
    ultimaVisita: string | null;
    ultimaCompra: string | null;
    proximasAcciones: number;
};

export type ResumenClienteAPI = {
    codcliente: string;
    nombre: string;
    telefono: string | null;
    email: string | null;
    direccion: {
        direccion: string;
        codpostal: string | null;
        ciudad: string | null;
        provincia: string | null;
        latitud: number | null;
        longitud: number | null;
    } | null;
    activo: boolean;
    clientedesde: string | null;
    ventas12meses: number | null;
    tratosabiertos: number;
    ultimavisita: string | null;
    ultimacompra: string | null;
    proximasacciones: number;
};

export type TratoFicha = {
    id: string;
    titulo: string;
    estado: string;
    valor: number;
    fecha: string | null;
};

export type TipoDocumento = "presupuesto" | "pedido" | "factura";

export type DocumentoCliente = {
    tipo: TipoDocumento;
    id: string;
    codigo: string;
    fecha: string;
    total: number;
};
