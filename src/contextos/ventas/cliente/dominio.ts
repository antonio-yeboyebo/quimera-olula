import { EstadoEntidad, initEstadoEntidad, MetaEntidad, stringNoVacio, ValidacionCampo, validacionDefecto, Validador } from "../../comun/dominio.ts";
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


export const initEstadoCliente = (cliente: Cliente): EstadoEntidad<Cliente> => {
    return initEstadoEntidad(cliente, metaCliente);
}

export const initEstadoDireccion = (direccion: DirCliente): EstadoEntidad<DirCliente> => {
    return initEstadoEntidad(direccion, metaDireccion);
}

const validacionesCliente = {
    tipo_id_fiscal: (cliente: EstadoEntidad<Cliente>): ValidacionCampo => {
        const valido = tipoIdFiscalValido(cliente.valor.tipo_id_fiscal);
        return {
            ...cliente.validacion.tipo_id_fiscal,
            valido: valido === true,
            textoValidacion: typeof valido === "string" ? valido : "",
        }
    },
    id_fiscal: (cliente: EstadoEntidad<Cliente>): ValidacionCampo => {
        const tipoValido = tipoIdFiscalValido(cliente.valor.tipo_id_fiscal);
        const valido = tipoValido
            ? idFiscalValido(cliente.valor.tipo_id_fiscal)(cliente.valor.id_fiscal)
            : true;
        return {
            ...cliente.validacion.id_fiscal,
            // ...validarRequerido(validacion, valor),
            valido: valido === true,
            textoValidacion: typeof valido === "string" ? valido : "",
        }
    },
}

const validadorCliente: Validador<Cliente> = (estado, campo) => {
    const cliente = estado.valor;
    const validacion = estado.validacion;
    switch (campo) {
        case "tipo_id_fiscal": {
            return {
                ...validacion,
                tipo_id_fiscal: validacionesCliente.tipo_id_fiscal(estado),
                id_fiscal: validacionesCliente.id_fiscal(estado),
            };
        }
        default: {
            if (campo in validacionesCliente) {
                const validacionCampo = validacionesCliente[campo as keyof typeof validacionesCliente];
                return {
                    ...validacion,
                    [campo]: validacionCampo(estado),
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

export const metaCliente: MetaEntidad<Cliente> = {
    bloqueados: ['nombre_agente'],
    requeridos: [
        'nombre',
        'tipo_id_fiscal',
        'id_fiscal'
    ],
    validador: validadorCliente,
};

export const metaDireccion: MetaEntidad<DirCliente> = {
    bloqueados: ['nombre_agente'],
    requeridos: [
        'tipo_via',
        'nombre_via',
        'ciudad'
    ],
    validador: (estado, campo) => {
        const entidad = estado.valor;
        const validacion = estado.validacion;
        return {
            ...validacion,
            [campo]: validacionDefecto(validacion[campo], entidad[campo as keyof DirCliente] as string),
        }
    }
};

export const initEstadoClienteVacio = () => initEstadoCliente(clienteVacio())


