import { Entidad } from "../../comun/diseño.ts";
import { stringNoVacio } from "../../comun/dominio.ts";
import { Cliente, DirCliente, NuevaDireccion, NuevoCliente } from "./diseño.ts";

export const idFiscalValido = (tipo: string) => (valor: string) => {
    if (tipo === "NIF") {
        return valor.length === 9 || "El NIF debe tener 9 caracteres";
    }
    if (tipo === "NAF") {
        return (valor.length === 11 && valor[0] === "E" && valor[1] === "S") || "El NAF debe cumplir ESXXXXXXXXXX";
    }
    return false;
}
export const tipoIdFiscalValido = (tipo: string): string | boolean => {
    return tipo === "NIF" || tipo === "NAF" || "El tipo debe ser NIF o NAF";
}

export const idFiscalValidoGeneral = (tipo: string, valor: string) => {
    return idFiscalValido(tipo)(valor) && tipoIdFiscalValido(tipo) === true;
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


export type EstadoEntidad<T extends Entidad> = {
    valor: T;
    valor_inicial: T;
    validacion: Validacion;
}
export type EstadoCliente = EstadoEntidad<Cliente>;
type ValidacionCampo = {
    valido: boolean;
    advertido: boolean;
    textoValidacion: string;
    deshabilitado: boolean;
    requerido: boolean;
}

export type Validacion = Record<
    string, ValidacionCampo
>;

export const puedoGuardarCliente = (estado: EstadoEntidad<Cliente>) => {
    const valor_inicial = estado.valor_inicial;
    const valor = estado.valor;
    return (
        Object.values(estado.validacion).every((v) => v.valido)
        && Object.keys(valor).some((k) => valor[k] !== valor_inicial[k])
    )
}

const initEstadoEntidad = <T extends Entidad>(entidad: T, deshabilitados: string[], requeridos: string[]) => {
    const validacion: Validacion = {}
    for (const k in entidad) {
        validacion[k] = {
            valido: true,
            advertido: false,
            textoValidacion: "",
            deshabilitado: deshabilitados.includes(k),
            requerido: requeridos.includes(k),
        };
    }
    const estado = {
        valor: entidad,
        valor_inicial: { ...entidad },
        validacion
    }
    return estado;
}

export const initEstadoCliente = (cliente: Cliente): EstadoCliente => {
    const deshabilitados = ['nombre_agente'];
    const requeridos = [
        'nombre',
        'tipo_id_fiscal',
        'id_fiscal'
    ];
    return initEstadoEntidad(cliente, deshabilitados, requeridos);
}

export const cambiarCliente = (cliente: EstadoCliente, campo: string, valor: string): EstadoCliente => {
    return validarCambio(
        cambiarCampo(cliente, campo, valor),
        campo, validar
    );
}



// const cambiarCampo = (cliente: EstadoCliente, campo: string, valor: string): EstadoCliente => {
//     return {
//         ...cliente,
//         valor: {
//             ...cliente.valor,
//             [campo]: valor
//         }
//     }
// }
const cambiarCampo = <T extends Entidad>(estado: EstadoEntidad<T>, campo: string, valor: string): EstadoEntidad<T> => {
    return {
        ...estado,
        valor: {
            ...estado.valor,
            [campo]: valor
        }
    }
}

// const validarCambio = (cliente: EstadoCliente, campo: string): EstadoCliente => {
//     return {
//         ...cliente,
//         validacion: validar(cliente, campo)
//     }
// }
const validarCambio = <T extends Entidad>(estado: EstadoEntidad<T>,
    campo: string,
    validador: Validador<T>
): EstadoEntidad<T> => {
    return {
        ...estado,
        validacion: validador(estado, campo)
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
    tipo_id_fiscal: (validacion: ValidacionCampo, valor: string): ValidacionCampo => {
        const valido = tipoIdFiscalValido(valor);
        return {
            ...validacion,
            valido: valido === true,
            textoValidacion: typeof valido === "string" ? valido : "",
        }
    },
    id_fiscal: (validacion: ValidacionCampo, valor: string, cliente: EstadoCliente): ValidacionCampo => {
        const tipoValido = tipoIdFiscalValido(cliente.valor.tipo_id_fiscal);
        const valido = tipoValido
            ? idFiscalValido(cliente.valor.tipo_id_fiscal)(valor)
            : true;
        return {
            ...validacion,
            // ...validarRequerido(validacion, valor),
            valido: valido === true,
            textoValidacion: typeof valido === "string" ? valido : "",
        }
    },
}

const validacionDefecto = (validacion: ValidacionCampo, valor: string): ValidacionCampo => {
    const valido = !validacion.requerido || stringNoVacio(valor);
    return {
        ...validacion,
        valido,
        textoValidacion: valido ? "" : "Campo requerido",
    }
}
type Validador<T extends Entidad> = (estado: EstadoEntidad<T>, campo: string) => Validacion;

const validar: Validador<Cliente> = (estado, campo) => {
    const cliente = estado.valor;
    const validacion = estado.validacion;
    switch (campo) {
        case "tipo_id_fiscal": {
            return {
                ...validacion,
                tipo_id_fiscal: validaciones.tipo_id_fiscal(validacion.tipo_id_fiscal, cliente.tipo_id_fiscal),
                id_fiscal: validaciones.id_fiscal(validacion.id_fiscal, cliente.id_fiscal, estado),
            };
        }
        default: {
            if (campo in validaciones) {
                // @ts-ignore
                const validacionCampo = validaciones[campo];
                return {
                    ...validacion,
                    [campo]: validacionCampo(validacion[campo], cliente[campo], estado),
                }
            } else {
                return {
                    ...validacion,
                    [campo]: validacionDefecto(validacion[campo], cliente[campo] as string),
                }
            }
        }
    }
}

export const initEstadoClienteVacio = () => initEstadoCliente(clienteVacio())


