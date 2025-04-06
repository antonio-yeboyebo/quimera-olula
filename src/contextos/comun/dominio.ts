import { Direccion, Entidad } from "./diseño.ts";

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

export const boolAString = (valor: boolean) => valor ? "Sí" : "No";

export const stringNoVacio = (valor: string) => valor.length > 0;

export type ValidacionCampo = {
    valido: boolean;
    textoValidacion: string;
    bloqueado: boolean;
    requerido: boolean;
}

export type Validacion = Record<string, ValidacionCampo>;

export type EstadoEntidad<T extends Entidad> = {
    valor: T;
    valor_inicial: T;
    validacion: Validacion;
}

export const puedoGuardarEntidad = <T extends Entidad>(estado: EstadoEntidad<T>) => {
    return entidadModificada(estado) && entidadValida(estado);
}

export const entidadValida = <T extends Entidad>(estado: EstadoEntidad<T>) =>
    Object.values(estado.validacion).every((v) => v.valido)


export const entidadModificada = <T extends Entidad>(estado: EstadoEntidad<T>) => {
    const valor_inicial = estado.valor_inicial;
    const valor = estado.valor;
    return (
        Object.keys(valor).some((k) => valor[k] !== valor_inicial[k])
    )
}

export type Validador<T extends Entidad> = (estado: EstadoEntidad<T>, campo: string) => Validacion;

export type MetaEntidad<T extends Entidad> = {
    deshabilitados: string[];
    requeridos: string[];
    validador: Validador<T>;
}

export const makeReductor = <T extends Entidad>(config: MetaEntidad<T>) => {

    return (estado: EstadoEntidad<T>, accion: Accion<T>): EstadoEntidad<T> => {

        switch (accion.type) {

            case "init": {
                return initEstadoEntidad<T>(
                    accion.payload.entidad,
                    config.deshabilitados,
                    config.requeridos
                );
            }

            case "set_campo": {
                return cambiarEstadoEntidad<T>(
                    estado,
                    accion.payload.campo,
                    accion.payload.valor,
                    config.validador
                );
            }

            default: {
                return estado;
            }
        }
    }
}

export const initEstadoEntidad = <T extends Entidad>(entidad: T, bloqueados: string[], requeridos: string[]) => {
    const validacion: Validacion = {}
    for (const k in entidad) {
        validacion[k] = {
            valido: true,
            textoValidacion: "",
            bloqueado: bloqueados.includes(k),
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

export const cambiarEstadoEntidad = <T extends Entidad>(
    estado: EstadoEntidad<T>,
    campo: string,
    valor: string,
    validador: Validador<T>,
): EstadoEntidad<T> => {

    return validarCambio(
        cambiarCampo<T>(estado, campo, valor),
        campo, validador
    );
}

const cambiarCampo = <T extends Entidad>(estado: EstadoEntidad<T>, campo: string, valor: string): EstadoEntidad<T> => {
    return {
        ...estado,
        valor: {
            ...estado.valor,
            [campo]: valor
        }
    }
}

const validarCambio = <T extends Entidad>(estado: EstadoEntidad<T>,
    campo: string,
    validador: Validador<T>
): EstadoEntidad<T> => {
    return {
        ...estado,
        validacion: validador(estado, campo)
    }
}

export type Accion<T extends Entidad> = {
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
export const campoEntidadAInput = <T extends Entidad>(estado: EstadoEntidad<T>, campo: string): EstadoInput => {
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
