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

// export const guardar = async (_: string, __: Partial<Cliente>) => {
//     await simularApi();
// }

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
    nombre_comercial: '',
    nombre_agente: '',
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

export type EstadoCliente = {
    valor: Cliente;
    valor_inicial: Cliente;
    validacion: Validacion;
}

export type Validacion = Record<
    string, {
        valido: boolean;
        advertido: boolean;
        erroneo: boolean;
        textoValidacion: string;
        deshabilitado: boolean;
    }
>;

export const puedoGuardarCliente = (validacion: Validacion) => {
    return (
        !Object.values(validacion).some((v) => v.erroneo)
        && Object.values(validacion).some((v) => v.valido)
    )
}

export const initEstadoCliente = (cliente: Cliente): EstadoCliente => {
    const deshabilitados = ['nombre_agente'];
    const validacion: Validacion = {}
    for (const k in cliente) {
        validacion[k] = {
            valido: false,
            advertido: false,
            erroneo: false,
            textoValidacion: "",
            deshabilitado: deshabilitados.includes(k),
        };
    }
    const estado = {
        valor: cliente,
        valor_inicial: { ...cliente },
        validacion
    }
    return estado;
}

export const cambiarCliente = (cliente: EstadoCliente, campo: string, valor: string): EstadoCliente => {
    console.log("cambiarCliente", campo, valor);
    const clienteCambiado = {
        ...cliente,
        valor: {
            ...cliente.valor,
            [campo]: valor
        }
    };
    const clienteValidado = {
        ...clienteCambiado,
        validacion: validar(clienteCambiado, campo)

    }
    return clienteValidado;
}

export const reductor = (cliente: EstadoCliente, payload): EstadoCliente => {
    console.log("reductor", payload, payload.campo);
    switch (payload.type) {
        case "set_cliente": {
            return initEstadoCliente(payload.cliente);
        }
        case "cambiar_cliente": {
            const nuevoCliente = cambiarCliente(cliente, payload.campo, payload.valor);
            console.log("nuevoCliente", nuevoCliente);
            return nuevoCliente;
        }
        default: {
            return cliente;
        }
    }
}


export const validar = (estado: EstadoCliente, campo: string): Validacion => {
    const cliente = estado.valor;
    const validacion = estado.validacion;
    switch (campo) {
        case "nombre": {
            const vacio = cliente.nombre.length == 0;
            const modificado = cliente.nombre !== estado.valor_inicial.nombre;
            const valido = !vacio
            const datos = {
                ...validacion[campo],
                valido: modificado && valido,
                advertido: false,
                erroneo: !valido,
                textoValidacion: vacio ? "El nombre no puede estar vacío" : "",
            }
            return {
                ...validacion,
                [campo]: datos,
            };
            break
        }
        case "tipo_id_fiscal": {
            const tipoIdFiscalEsValido = tipoIdFiscalValido(cliente.tipo_id_fiscal)
            const idFiscalEsValido = !tipoIdFiscalEsValido || idFiscalValido(cliente.tipo_id_fiscal)(cliente.id_fiscal)
            const validacionTipoIdFiscal = {
                ...validacion.tipo_id_fiscal,
                valido: tipoIdFiscalEsValido,
                advertido: false,
                erroneo: !tipoIdFiscalEsValido,
                textoValidacion: !tipoIdFiscalEsValido ? "El tipo de ID Fiscal no es válido" : "",
            }
            const validacionIdFiscal = {
                ...validacion.id_fiscal,
                valido: idFiscalEsValido,
                advertido: false,
                erroneo: !idFiscalEsValido,
                textoValidacion: !idFiscalEsValido ? "El ID Fiscal no es válido para el tipo indicado" : "",
            }
            return {
                ...validacion,
                tipo_id_fiscal: validacionTipoIdFiscal,
                id_fiscal: validacionIdFiscal,
            };
            break
        }
        case "id_fiscal": {
            const tipoIdFiscalEsValido = tipoIdFiscalValido(cliente.tipo_id_fiscal)
            const idFiscalEsValido = !tipoIdFiscalEsValido || idFiscalValido(cliente.tipo_id_fiscal)(cliente.id_fiscal)
            const validacionIdFiscal = {
                ...validacion.id_fiscal,
                valido: idFiscalEsValido,
                advertido: false,
                erroneo: !idFiscalEsValido,
                textoValidacion: !idFiscalEsValido ? "El ID Fiscal no es válido para el tipo indicado" : "",
            }
            return {
                ...validacion,
                id_fiscal: validacionIdFiscal,
            };
            break
        }
        default: {
            const modificado = estado.valor[campo] !== estado.valor_inicial[campo];
            const validacionCampo = {
                ...validacion[campo],
                valido: modificado,
            }
            return {
                ...validacion,
                [campo]: validacionCampo,
            };
        }
    }
    return validacion
}

export const initEstadoClienteVacio = () => initEstadoCliente(clienteVacio())


