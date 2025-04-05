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


// const simularApi = async () => {
//     const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
//     await delay(700);
// }

export type EstadoCliente = {
    valor: Cliente;
    valor_inicial: Cliente;
    validacion: Validacion;
}
type ValidacionCampo = {
    valido: boolean;
    advertido: boolean;
    // erroneo: boolean;
    textoValidacion: string;
    deshabilitado: boolean;
}

export type Validacion = Record<
    string, ValidacionCampo
>;

export const puedoGuardarCliente = (estado: EstadoCliente) => {
    const valor_inicial = estado.valor_inicial;
    const valor = estado.valor;
    return (
        Object.values(estado.validacion).every((v) => v.valido)
        && Object.keys(valor).some((k) => valor[k] !== valor_inicial[k])
    )
}

export const initEstadoCliente = (cliente: Cliente): EstadoCliente => {
    const deshabilitados = ['nombre_agente'];
    const validacion: Validacion = {}
    for (const k in cliente) {
        validacion[k] = {
            valido: true,
            advertido: false,
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
    return validarCambio(
        cambiarCampo(cliente, campo, valor),
        campo
    );

}

const cambiarCampo = (cliente: EstadoCliente, campo: string, valor: string): EstadoCliente => {
    return {
        ...cliente,
        valor: {
            ...cliente.valor,
            [campo]: valor
        }
    }
}
const validarCambio = (cliente: EstadoCliente, campo: string): EstadoCliente => {
    return {
        ...cliente,
        validacion: validar(cliente, campo)
    }
}

type Accion = {
    type: 'init';
    payload: {
        entidad: Cliente
    }
} | {
    type: 'set_campo';
    payload: {
        campo: string;
        valor: string;
    }
}

export const reductor = (cliente: EstadoCliente, accion: Accion): EstadoCliente => {
    switch (accion.type) {
        case "init": {
            return initEstadoCliente(accion.payload.entidad);
        }
        case "set_campo": {
            const nuevoCliente = cambiarCliente(cliente, accion.payload.campo, accion.payload.valor);
            return nuevoCliente;
        }
        default: {
            return cliente;
        }
    }
}

export type EstadoClienteInput = {
    nombre: string;
    valor: string;
    textoValidacion: string;
    deshabilitado: boolean;
    erroneo: boolean;
    advertido: boolean;
    valido: boolean;
}
export const estadoAInput = (estado: EstadoCliente, campo: string): EstadoClienteInput => {
    const validacion = estado.validacion[campo];
    const cliente = estado.valor;
    const valor = cliente[campo] as string;
    const cambiado = valor !== estado.valor_inicial[campo];
    return {
        nombre: campo,
        valor: valor,
        deshabilitado: validacion.deshabilitado,
        valido: cambiado && validacion.valido,
        erroneo: !validacion.valido,
        advertido: validacion.advertido,
        textoValidacion: validacion.textoValidacion,
    }
}

const validaciones = {
    nombre: (validacion: ValidacionCampo, valor: string): ValidacionCampo => {
        return {
            ...validacion,
            ...validarRequerido(validacion, valor),
        }
    },
    tipo_id_fiscal: (validacion: ValidacionCampo, valor: string): ValidacionCampo => {
        const valido = tipoIdFiscalValido(valor);
        return {
            ...validacion,
            valido: valido,
            advertido: false,
            textoValidacion: valido ? "" : "Tipo de ID Fiscal no válido",
        }
    },
    id_fiscal: (validacion: ValidacionCampo, valor: string, cliente: EstadoCliente): ValidacionCampo => {
        const tipoValido = tipoIdFiscalValido(cliente.valor.tipo_id_fiscal);
        const valido = tipoValido !== true || idFiscalValido(cliente.valor.tipo_id_fiscal)(valor);
        return {
            ...validacion,
            // ...validarRequerido(validacion, valor),
            valido: valido,
            textoValidacion: valido ? "" : "Formato no válido",
        }
    },
}

const validarRequerido = (validacion: ValidacionCampo, valor: string): ValidacionCampo => {
    return {
        ...validacion,
        valido: stringNoVacio(valor),
        textoValidacion: stringNoVacio(valor) ? "" : "Campo requerido",
    }
}
const validar = (estado: EstadoCliente, campo: string): Validacion => {
    const cliente = estado.valor;
    const validacion = estado.validacion;
    switch (campo) {
        case "nombre": {
            return {
                ...validacion,
                [campo]: validaciones.nombre(validacion[campo], cliente[campo]),
            };
        }
        case "tipo_id_fiscal": {
            return {
                ...validacion,
                tipo_id_fiscal: validaciones.tipo_id_fiscal(validacion.tipo_id_fiscal, cliente.tipo_id_fiscal),
                id_fiscal: validaciones.id_fiscal(validacion.id_fiscal, cliente.id_fiscal, estado),
            };
        }
        case "id_fiscal": {
            return {
                ...validacion,
                id_fiscal: validaciones.id_fiscal(validacion.id_fiscal, cliente.id_fiscal, estado),
            };
        }
    }
    return validacion
}

export const initEstadoClienteVacio = () => initEstadoCliente(clienteVacio())


