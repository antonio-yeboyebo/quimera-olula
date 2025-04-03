import { stringNoVacio } from "../../comun/dominio.ts";
import { Cliente, DirCliente, NuevaDireccion, NuevoCliente } from "./diseño.ts";

export const idFiscalValido = (tipo: string) => (valor: string) => {
    if (tipo === "NIF") {
        return valor.length === 9;
    }
    if (tipo === "NAF") {
        return valor.length === 11 && valor[0] === "E" && valor[1] === "S";
    }
    return false;
}
export const tipoIdFiscalValido = (tipo: string) => {
    return tipo === "NIF" || tipo === "NAF";
}

export const idFiscalValidoGeneral = (tipo: string, valor: string) => {
    return idFiscalValido(tipo)(valor) && tipoIdFiscalValido(tipo);
}

export const guardar = async (_: string, __: Partial<Cliente>) => {
    await simularApi();
}

export const puedoMarcarDireccionFacturacion = (direccion: DirCliente) => {
    return !direccion.dir_facturacion;
}


export const clienteVacio = (): Cliente => ({
    id: '',
    nombre: '',
    id_fiscal: '',
    tipo_id_fiscal: '',
    email: '',
    telefono: '',
    agente_id: '',
    divisa_id: '',
    serie_id: '',
    forma_pago_id: '',
    grupo_iva_negocio_id: '',
})


export const validadoresDireccion = {
    nuevaDireccion: (valor: NuevaDireccion) => (
        validadoresDireccion.tipo_via(valor.tipo_via) &&
        validadoresDireccion.nombre_via(valor.nombre_via) &&
        validadoresDireccion.ciudad(valor.ciudad)
    ),
    tipo_via: (valor: string) => stringNoVacio(valor),
    nombre_via: (valor: string) => stringNoVacio(valor),
    ciudad: (valor: string) => stringNoVacio(valor),
}

export const validadoresCliente = {
    nombre: (valor: string) => stringNoVacio(valor),
    id_fiscal: (valor: string) => stringNoVacio(valor),
    nuevoCliente: (cliente: NuevoCliente) =>
        cliente.nombre && cliente.id_fiscal,
};


const simularApi = async () => {
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    await delay(700);
}