import { Direccion, Entidad, ObjetoValor } from "./diseño.ts";

export const actualizarEntidadEnLista = <T extends Entidad>(entidades: T[], entidad: T): T[] => {
    return entidades.map(e => {
        return e.id === entidad.id ? entidad : e
    });
}

export const quitarEntidadDeLista = <T extends Entidad>(lista: T[], elemento: T): T[] => {
    return lista.filter((e) => e.id !== elemento.id);
}

export const refrescarSeleccionada = <T extends Entidad>(entidades: T[], id: string | undefined, setSeleccionada: (e: T | null) => void) => {
    const nuevaSeleccionada = id
        ? entidades.find((e) => e.id === id)
        : null
    setSeleccionada(nuevaSeleccionada ? nuevaSeleccionada : null);
}

export const direccionCompleta = (valor: Direccion) => `${valor.tipo_via ? (valor.tipo_via + ' ') : ''} ${valor.nombre_via}, ${valor.ciudad}`;
export const direccionVacia: Direccion = {
    tipo_via: '',
    nombre_via: '',
    ciudad: '',
    numero: '',
    otros: '',
    cod_postal: '',
    provincia_id: 0,
    provincia: '',
    pais_id: '',
    apartado: '',
    telefono: '',
}
export const boolAString = (valor: boolean) => valor ? "Sí" : "No";

export const stringNoVacio = (valor: string) => valor.length > 0;

export type ValidacionCampo = {
    valido: boolean;
    textoValidacion: string;
    bloqueado: boolean;
    requerido: boolean;
}

export type Validacion = Record<string, ValidacionCampo>;

export type EstadoObjetoValor<T extends ObjetoValor> = {
    valor: T;
    valor_inicial: T;
    validacion: Validacion;
}

export const puedoGuardarObjetoValor = <T extends ObjetoValor>(estado: EstadoObjetoValor<T>) => {
    return entidadModificada(estado) && entidadValida(estado);
}

export const entidadValida = <T extends ObjetoValor>(estado: EstadoObjetoValor<T>) =>
    Object.values(estado.validacion).every((v) => v.valido)


export const entidadModificada = <T extends ObjetoValor>(estado: EstadoObjetoValor<T>) => {
    const valor_inicial = estado.valor_inicial;
    const valor = estado.valor;
    return (
        Object.keys(valor).some((k) => valor[k] !== valor_inicial[k])
    )
}

export type Validador<T extends ObjetoValor> = (estado: EstadoObjetoValor<T>, campo: string) => Validacion;

export type MetaObjetoValor<T extends ObjetoValor> = {
    bloqueados: string[];
    requeridos: string[];
    validador: Validador<T>;
}

export const makeReductor = <T extends ObjetoValor>(meta: MetaObjetoValor<T>) => {

    return (estado: EstadoObjetoValor<T>, accion: Accion<T>): EstadoObjetoValor<T> => {

        switch (accion.type) {

            case "init": {
                return initEstadoObjetoValor<T>(
                    accion.payload.entidad,
                    meta
                );
            }

            case "set_campo": {
                return cambiarEstadoObjetoValor<T>(
                    estado,
                    accion.payload.campo,
                    accion.payload.valor,
                    meta.validador
                );
            }

            default: {
                return estado;
            }
        }
    }
}

export const initEstadoObjetoValor = <T extends ObjetoValor>(objetoValor: T, meta: MetaObjetoValor<T>) => {
    const validacion: Validacion = {}
    for (const k in objetoValor) {
        const requerido = meta.requeridos.includes(k);
        validacion[k] = {
            valido: requerido && objetoValor[k] === '' ? false : true,
            textoValidacion: "",
            bloqueado: meta.bloqueados.includes(k),
            requerido: requerido,
        };
    }
    const estado = {
        valor: objetoValor,
        valor_inicial: { ...objetoValor },
        validacion
    }
    return estado;
}

export const cambiarEstadoObjetoValor = <T extends ObjetoValor>(
    estado: EstadoObjetoValor<T>,
    campo: string,
    valor: string,
    validador: Validador<T>,
): EstadoObjetoValor<T> => {

    return validarCambio(
        cambiarCampo<T>(estado, campo, valor),
        campo, validador
    );
}

const cambiarCampo = <T extends ObjetoValor>(
    estado: EstadoObjetoValor<T>,
    campo: string,
    valor: string
): EstadoObjetoValor<T> => {

    console.log('cambiarCampo', campo, valor, typeof valor);
    return {
        ...estado,
        valor: {
            ...estado.valor,
            [campo]: valor
        }
    }
}

const validarCambio = <T extends ObjetoValor>(estado: EstadoObjetoValor<T>,
    campo: string,
    validador: Validador<T>
): EstadoObjetoValor<T> => {
    return {
        ...estado,
        validacion: validador(estado, campo)
    }
}

export type Accion<T extends ObjetoValor> = {
    type: 'init';
    payload: {
        entidad: T
    }
} | {
    type: 'set_campo';
    payload: {
        campo: string;
        valor: string;
    }
}

export type EstadoInput = {
    nombre: string;
    valor: string;
    textoValidacion: string;
    deshabilitado: boolean;
    erroneo: boolean;
    advertido: boolean;
    valido: boolean;
}
export const campoObjetoValorAInput = <T extends ObjetoValor>(
    estado: EstadoObjetoValor<T>,
    campo: string
): EstadoInput => {

    const validacion = estado.validacion[campo];
    const valor = estado.valor[campo] as string;
    const cambiado = valor !== estado.valor_inicial[campo];
    return {
        nombre: campo,
        valor: valor,
        deshabilitado: validacion.bloqueado,
        valido: cambiado && validacion.valido,
        erroneo: !validacion.valido,
        advertido: false,
        textoValidacion: validacion.textoValidacion,
    }
}

export const validacionDefecto = (validacion: ValidacionCampo, valor: string): ValidacionCampo => {
    const valido = !validacion.requerido || stringNoVacio(valor);
    return {
        ...validacion,
        valido,
        textoValidacion: valido ? "" : "Campo requerido",
    }
}

export type ValidadorCampo<T extends ObjetoValor> = (estado: EstadoObjetoValor<T>) => ValidacionCampo;
export type ValidadorCampos<T extends ObjetoValor> = Record<string, ValidadorCampo<T>>;

export const makeValidador = <T extends ObjetoValor>(
    validadorCampos: ValidadorCampos<T>
) => (
    estado: EstadoObjetoValor<T>, campo: string
) => {

        const validacion = estado.validacion;

        return (campo in validadorCampos)
            ? {
                ...validacion,
                [campo]: validarCampo(estado, campo, validadorCampos[campo]),
            }
            : {
                ...validacion,
                [campo]: validarCampo(estado, campo),
            }

    }

export const validarCampo = <T extends ObjetoValor>(
    estado: EstadoObjetoValor<T>,
    campo: string, validador?: ValidadorCampo<T>
): ValidacionCampo => {

    const entidad = estado.valor;
    const validacion = estado.validacion;
    const valor = entidad[campo] as string;
    const valido = !validacion[campo].requerido || stringNoVacio(valor);
    if (valido !== true) {
        return {
            ...validacion[campo],
            valido: false,
            textoValidacion: "Campo requerido",
        }
    }
    if (validador) {
        const validacionCampo = validador(estado);
        return {
            ...validacion[campo],
            ...validacionCampo,
        }
    }
    return {
        ...validacion[campo],
        valido: true,
        textoValidacion: "",
    }
}