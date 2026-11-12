import { Permiso, permisosGrupo } from "./api/permisos.js";
import { QError } from "./contexto.js";
import { ClausulaFiltro, Contexto, Criteria, Direccion, Entidad, EventoMaquina, Filtro, Maquina, Modelo, Orden, ProcesarContexto, TipoInput, ValorCampoUI } from "./diseño.js";
import { filtroDefecto, ordenDefecto, paginacionDefecto } from "./url-params.js";
import { UiProps, ValorControl } from "./useModelo.js";

export const actualizarEntidadEnLista = <T extends Entidad>(entidades: T[], entidad: T): T[] => {
    return entidades.map(e => {
        return e.id === entidad.id ? entidad : e
    });
}

export const quitarEntidadDeLista = <T extends Entidad>(lista: T[], id: string): T[] => {
    return lista.filter((e) => e.id !== id);
}

export const refrescarSeleccionada = <T extends Entidad>(entidades: T[], id: string | undefined, setSeleccionada: (e?: string) => void) => {
    const nuevaSeleccionada = id
        ? entidades.find((e) => e.id === id)
        : null
    setSeleccionada(nuevaSeleccionada ? nuevaSeleccionada.id : undefined);
}

export const getElemento = <T extends Entidad>(lista: T[], id: string): T => {
    const elementos = lista.filter((e) => e.id === id);
    if (elementos.length === 1) {
        return elementos[0];
    }
    throw new Error(`No se encontró el elemento con id ${id}`);
};

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

export const stringNoVacio = (valor: string) => {
    return valor.length > 0;
}

export type ValidacionCampo = {
    valido: boolean;
    textoValidacion: string;
    bloqueado: boolean;
    requerido: boolean;
}

export type Validacion = Record<string, ValidacionCampo>;

export type EstadoModelo<T extends Modelo> = {
    valor: T;
    valor_inicial: T;
}



// export type Validador<T extends Modelo> = (estado: EstadoModelo<T>, campo: string) => Validacion;
export type MetaCampo<T extends Modelo> = {
    nombre?: string;
    tipo?: TipoInput;
    requerido?: boolean | ((modelo: T) => boolean);
    bloqueado?: boolean;
    validacion?: (modelo: T) => string | boolean;
    positivo?: boolean
    divisa?: string
    decimales?: number
    maximo?: number
    minimo?: number
    /** MetaModelo del sub-objeto. Activa validación y comparación recursivas. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta?: MetaModelo<any>;
    /** MetaModelo de cada ítem de la lista. Activa validación y comparación de arrays. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    itemMeta?: MetaModelo<any>;
    /** Número mínimo de ítems requeridos (solo con itemMeta). */
    minItems?: number;
    /** Número máximo de ítems permitidos (solo con itemMeta). */
    maxItems?: number;
}
// export type TipoValorCampo = string | boolean | number | null;

export type MetaModelo<T extends Modelo> = {
    campos?: Record<string, MetaCampo<T>>;
    editable?: (modelo: T, campo?: string) => boolean;
    validacion?: (modelo: T) => string | boolean;
    onChange?: (modelo: T, campo: string, valorAnterior: unknown, otros?: Record<string, unknown>) => T;
}


export const makeReductor = <T extends Modelo>() => {

    return (estado: T, accion: Accion<T>): T => {

        switch (accion.type) {

            case "set": {
                return accion.payload.entidad;
            }

            // case "set_campo": {
            //     const valor = convertirValorCampo<T>(
            //         accion.payload.valor,
            //         accion.payload.campo,
            //         meta.campos
            //     );
            //     return {
            //         ...estado,
            //         [accion.payload.campo]: valor
            //     }
            // }

            default: {
                return { ...estado };
            }
        }
    }
}

// const convertirValorCampo = <T extends Modelo>(valor: string, campo: string, campos?: Record<string, MetaCampo<T>>) => {
//     if (!campos) return valor;
//     if (!(campo in campos)) return valor;

//     if (valor === null) {
//         return null;
//     }

//     switch (campos[campo].tipo) {
//         case 'checkbox':
//             return valor === 'true'
//         case 'numero': {
//             const numero = parseFloat(valor);
//             return isNaN(numero) ? '' : numero; // Quizá hay que convertir a null y pasar luego en el uiProps a ''
//         }
//         default:
//             return valor;
//     }
// }

export const initEstadoModelo = <T extends Modelo>(modelo: T) => {
    const estado = {
        valor: { ...modelo },
        valor_inicial: modelo,
    }
    return estado;
}

// export const cambiarEstadoModelo = <T extends Modelo>(
//     estado: EstadoModelo<T>,
//     campo: string,
//     valor: TipoValorCampo,
// ): EstadoModelo<T> => {

//     return {
//         ...estado,
//         valor: {
//             ...estado.valor,
//             [campo]: valor
//         }
//     }
// }

export type Accion<T extends Modelo> = {
    type: 'set';
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
export const campoModeloAInput = <T extends Modelo>(
    estado: EstadoModelo<T>,
    campo: string
): EstadoInput => {

    // const validacion = estado.validacion[campo];
    const validacion = {
        valido: true,
        textoValidacion: "",
        bloqueado: false,
        requerido: false,
    }
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

// export const validacionDefecto = (validacion: ValidacionCampo, valor: string): ValidacionCampo => {
//     const valido = !validacion.requerido || stringNoVacio(valor);
//     return {
//         ...validacion,
//         valido,
//         textoValidacion: valido ? "" : "Campo requerido",
//     }
// }


export const modeloEsEditable = <T extends Modelo>(meta: MetaModelo<T>) => (modelo: T, campo?: string) => {
    const campos = meta.campos || {};
    const bloqueado = campo
        ? campo in campos && campos[campo]?.bloqueado
        : false
    return (campo)
        ? meta.editable
            ? meta.editable(modelo, campo) && !bloqueado
            : !bloqueado
        : meta.editable
            ? meta.editable(modelo)
            : true;
}

export const convertirCampoDesdeUI = <T extends Modelo>(meta: MetaModelo<T>) => (campo: string, valor: string | null): unknown => {

    if (!meta.campos) {
        if (valor === '') {
            return null;
        }
        return valor;
    }

    if (!meta.campos[campo]) {
        if (valor === '') {
            return null;
        }
        return valor;
    }

    if (!meta.campos[campo].tipo) {
        if (valor === '') {
            return null;
        }
        return valor;
    }

    const tipo = meta.campos[campo].tipo;

    switch (tipo) {
        case 'checkbox': {
            return valor; // Ver un caso y cambiar a boolean
        }
        case 'moneda':
        case 'decimal':
        case 'numero': {
            if (valor === null || valor === '') {
                return null;
            }
            const numero = parseFloat(valor);

            if (isNaN(numero)) {
                throw new Error('No es un número');
            }

            return numero;

        }
        case 'entero': {
            if (valor === null || valor === '') {
                return null;
            }
            const numero = parseInt(valor);

            if (isNaN(numero)) {
                throw new Error('No es un número entero');
            }

            return numero;
        }
        case 'multiseleccion': {
            if (valor === null || !valor.length || valor === "") return null;
            if (valor.length === 1 && valor[0] === "") return null;

            return valor;
        }
        case 'intervalo_numeros': {
            if (valor === null || !valor.length || valor === "") {
                return null;
            }

            const [desde, hasta] = valor;
            return [desde ? parseFloat(desde) : undefined, hasta ? parseFloat(hasta) : undefined]
        }
        case 'intervalo_fechas': {
            if (valor === null || !valor.length || valor === "") {
                return null;
            }
            if (!Array.isArray(valor)) return valor;

            const [desde, hasta] = valor;
            return [desde ? new Date(Date.parse(desde)) : undefined, hasta ? new Date(Date.parse(hasta)) : undefined]
        }
        case 'fecha': {
            if (valor === null || valor === '') {
                return null;
            }

            return new Date(Date.parse(valor));
        }
        case 'fecha_hora': {
            if (valor === null || valor === '') {
                return null;
            }

            return new Date(Date.parse(valor));
        }
        default:
            return valor;
    }
}


export const formatoValorCampoValido = <T extends Modelo>(meta: MetaModelo<T>) => (campo: string, valor: unknown): boolean => {

    const metaCampo = meta.campos?.[campo];
    const tipoCampo = metaCampo?.tipo;

    if (valor === null) {
        return true;
    }

    if (tipoCampo === 'moneda') {

        const divisa = metaCampo?.divisa || 'EUR';
        const decimales = decimalesPorMoneda(divisa);
        return valorDecimalEsValido(String(valor), decimales);

    } else if (tipoCampo === 'decimal') {

        const decimales = metaCampo?.decimales;
        if (!decimales) {
            return true;
        }
        return valorDecimalEsValido(String(valor), decimales);

        // } else if (tipoCampo === 'entero') {
        //     return valorEnteroEsValido(String(valor));
    }
    return true;
}

// const valorEnteroEsValido = (valor: string): boolean => {
//     return new RegExp(`^\\d+$`).test(String(valor));
// }

const valorDecimalEsValido = (valor: string, decimales: number): boolean => {
    return new RegExp(`^-?(\\d?)+(\\.\\d{0,${decimales}})?$`).test(String(valor));
}
// No permite .23 y es incómodo de editar
// const valorDecimalEsValido2 = (valor: string, decimales: number): boolean => {
//     return new RegExp(`^\\d+(\\.\\d{0,${decimales}})?$`).test(String(valor));
// }

export const convertirCampoHaciaUI = <T extends Modelo>(meta: MetaModelo<T>) => (campo: string, valor: unknown): ValorCampoUI => {
    if (valor === null || valor === undefined) {
        return '';
    }
    const tipoCampo = meta.campos?.[campo]?.tipo;
    switch (tipoCampo) {

        case 'texto':
            return String(valor) || '';

        case 'numero':
        case 'moneda':
        case 'decimal':
        case 'entero':
            return Number(valor).toString();

        case 'checkbox':
            return (valor as boolean).toString();

        // case 'fecha':
        //     return (valor as Date).toISOString().split('T')[0];
        case 'intervalo_numeros': {
            const [desde, hasta] = (valor as [number | undefined, number | undefined]);

            return [Number(desde).toString(), Number(hasta).toString()] as unknown as string;
        }
        case 'intervalo_fechas': {
            if (!Array.isArray(valor)) return String(valor);

            const [desde, hasta] = (valor as [Date | undefined, Date | undefined]);

            return [desde?.toISOString().slice(0, 10) as string, hasta?.toISOString().slice(0, 10) as string] as unknown as string;
        }
        case 'fecha': {
            if (typeof valor === 'string') return valor.slice(0, 10);
            return (valor as Date).toISOString().slice(0, 10);
        }
        case 'fecha_hora': {
            if (typeof valor === 'string') return valor.slice(0, 16);
            return (valor as Date).toISOString().slice(0, 16);
        }

        default:
            return valor as string;
    }
}

const getUiProps = <M extends Modelo>(
    modelo: M,
    modeloInicial: M,
    meta: MetaModelo<M>,
    onModeloCambiado: (modelo: M) => void,
    onModeloListo?: (modelo: M, campo: string) => Promise<void | M>,
    errorGuardado?: QError | null
) =>
    (campo: string, secundario?: string): UiProps => {

        const validacion = validacionCampoModelo(meta)(modelo, campo);
        const valido = validacion === true;
        const valor = modelo[campo];
        const textoValidacion = valor === modeloInicial[campo]
            ? ''
            : typeof validacion === "string"
                ? validacion
                : '';
        const editable = modeloEsEditable(meta)(modelo, campo);
        const cambiado = valor !== modeloInicial[campo];
        const falloGuardado = !!errorGuardado && cambiado;
        const campos = meta.campos || {};
        const tipoCampo = campo in campos && campos[campo]?.tipo
            ? campos[campo].tipo
            : "texto";

        const requeridoRaw = campo in campos ? campos[campo]?.requerido : undefined;
        const requeridoResuelto = typeof requeridoRaw === 'function' ? requeridoRaw(modelo) : requeridoRaw;
        const opcional = requeridoResuelto === false;

        const conversionTipo = {
            "boolean": "checkbox",
            "dolar": "moneda",
        };

        const tipo = (conversionTipo[tipoCampo as keyof typeof conversionTipo] || tipoCampo) as TipoInput;
        const valorUI = convertirCampoHaciaUI(meta)(campo, valor);
        const divisa = campo in campos ? campos[campo]?.divisa : undefined;
        const decimales = campo in campos ? campos[campo]?.decimales : undefined;

        return {
            nombre: campo,
            valor: valorUI,
            tipo: tipo,
            deshabilitado: false,
            valido: cambiado && valido && !falloGuardado,
            erroneo: !valido || falloGuardado,
            advertido: false,
            opcional,
            modificado: cambiado,
            soloLectura: !editable || !modeloEsEditable(meta)(modelo),
            textoValidacion: textoValidacion,
            onChange: setCampo(modelo, meta, onModeloCambiado, campo, secundario),
            evaluarCambio: evaluarCambio(campo, modelo, modeloInicial, meta, onModeloListo),
            descripcion: secundario ? modelo[secundario] as string : undefined,
            divisa,
            decimales,
        }
    }

const evaluarCambio = <M extends Modelo>(
    campo: string,
    modelo: M,
    modeloInicial: M,
    meta: MetaModelo<M>,
    onModeloListo?: (modelo: M, campo: string) => Promise<void | M>
) =>
    async () => {
        if (!onModeloListo) {
            return;
        }
        if (modeloModificado(modeloInicial, modelo, meta) && modeloEsValido(meta)(modelo)) {
            await onModeloListo(modelo, campo);
        }
    }

const setCampo = <M extends Modelo>(
    modelo: M,
    meta: MetaModelo<M>,
    onModeloCambiado: (modelo: M) => void,
    campo: string,
    segundo?: string
) => async (_valor: ValorControl): Promise<void> => {

    let valor = _valor === undefined ? null : _valor;
    let descripcion: string | undefined = undefined;


    const valorAnterior = modelo[campo];

    if (typeof _valor === "object" && _valor && 'valor' in _valor) {
        valor = _valor.valor;
        if (segundo) {
            descripcion = _valor.descripcion;
        }
    }
    if (!formatoValorCampoValido(meta)(campo, valor)) {
        return;
    }

    const valorModelo = convertirCampoDesdeUI(meta)(campo, valor as string);

    console.log("Valor", valor, "Descripcion", descripcion)
    let nuevoModelo = {
        ...modelo,
        [campo]: valorModelo,
    } as M
    if (segundo && descripcion !== undefined) {
        nuevoModelo = {
            ...nuevoModelo,
            [segundo]: descripcion,
        } as M
    }
    if (meta.onChange) {
        const otros = typeof _valor === "object" ? _valor as Record<string, unknown> : {};
        nuevoModelo = meta.onChange(nuevoModelo as M, campo, valorAnterior, otros);
    }
    onModeloCambiado(nuevoModelo);
};

export const validacionCampoModelo = <T extends Modelo>(meta: MetaModelo<T>) => (modelo: T, campo: string) => {
    const campos = meta.campos || {};
    const valor = modelo[campo];
    const tipoCampo = campos[campo]?.tipo;

    if (campo.split(',').length > 1) {
        campo = campo.split(',')[0].trim();
    }
    const requeridoRaw = campo in campos ? campos[campo]?.requerido : undefined;
    const requerido = typeof requeridoRaw === 'function' ? requeridoRaw(modelo) : requeridoRaw;

    if (requerido && (valor === null || valor === undefined || valor === "")) {
        return "Campo requerido";
    }

    if (campos[campo]?.tipo === "email" && typeof valor === "string" && valor.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(valor)) {
            return "Formato Email incorrecto";
        }
    }

    if (tipoCampo && ["texto", "fecha", "numero", "selector", "autocompletar"].includes(tipoCampo) && requerido && valor === '') {
        return "Campo requerido";
    }
    const tipoCampoEsNumero = ['numero', 'decimal', 'entero'].includes(tipoCampo as string);

    if (tipoCampoEsNumero) {
        const numero = Number(valor);

        if (campos[campo]?.positivo) {
            if (numero < 0) {
                return "El número debe ser positivo";
            }
        }

        if (campos[campo]?.maximo) {
            const maximo = Number(campos[campo]?.maximo);
            if (numero > maximo) {
                return `El número debe ser menor o igual a ${maximo}`;
            }
        }

        if (campos[campo]?.minimo) {
            const minimo = Number(campos[campo]?.minimo);
            if (numero < minimo) {
                return `El número debe ser mayor o igual a ${minimo}`;
            }
        }
    }

    // Sub-objeto: validación recursiva con su propio MetaModelo
    if (campos[campo]?.meta && typeof valor === "object" && valor !== null && !Array.isArray(valor)) {
        const subValido = modeloEsValido(campos[campo].meta!)(valor as Modelo);
        if (!subValido) return "Sub-objeto inválido";
    }

    // Lista: validación de cardinalidad e ítems
    if (campos[campo]?.itemMeta && Array.isArray(valor)) {
        const min = campos[campo].minItems ?? 0;
        if (valor.length < min) {
            return `Se requieren al menos ${min} elemento${min !== 1 ? "s" : ""}`;
        }
        const max = campos[campo].maxItems;
        if (max !== undefined && valor.length > max) {
            return `Se permiten como máximo ${max} elemento${max !== 1 ? "s" : ""}`;
        }
        const itemInvalido = valor.some(
            (item) => !modeloEsValido(campos[campo].itemMeta!)(item as Modelo)
        );
        if (itemInvalido) return "Algún elemento de la lista es inválido";
    }

    const validacion = campos[campo]?.validacion
    return validacion
        ? validacion(modelo)
        : true;

}
export const campoModeloEsValido = <T extends Modelo>(meta: MetaModelo<T>) => (modelo: T, campo: string) =>
    validacionCampoModelo(meta)(modelo, campo) === true;

export const modeloEsValido = <T extends Modelo>(meta: MetaModelo<T>) => (modelo: T) => {
    const camposValidos = Object.keys(modelo).every((k) =>
        campoModeloEsValido(meta)(modelo, k) === true
    )
    const validacionGeneral = meta.validacion
        ? meta.validacion(modelo) === true
        : true;

    return camposValidos && validacionGeneral;
}

export const modeloModificadoYValido = <T extends Modelo>(meta: MetaModelo<T>) => (estado: EstadoModelo<T>) => {
    return modeloModificado(estado.valor_inicial, estado.valor, meta) && modeloEsValido(meta)(estado.valor);
}

export const getFormProps = <M extends Modelo>(
    modelo: M,
    modeloInicial: M,
    meta: MetaModelo<M>,
    onModeloCambiado: (modelo: M) => void,
    onModeloListo?: (modelo: M, campo: string) => Promise<void | M>,
    errorGuardado?: QError | null
): FormModelo => {
    return {
        uiProps: getUiProps(
            modelo,
            modeloInicial,
            meta,
            onModeloCambiado,
            onModeloListo,
            errorGuardado
        ),
        modificado: modeloModificado(modeloInicial, modelo, meta),
        valido: modeloEsValido(meta)(modelo),
        editable: modeloEsEditable(meta)(modelo),
    } as const;
}


export type FormModelo = {
    uiProps: (campo: string, secundario?: string) => UiProps,
    modificado: boolean,
    valido: boolean,
    editable: boolean,
}

export const modeloModificado = <T extends Modelo>(valor_inicial: T, valor: T, meta?: MetaModelo<T>): boolean => {
    return Object.keys(valor).some((k) => {
        const v = valor[k];
        const vi = valor_inicial[k];
        const mc = meta?.campos?.[k];

        // Sub-objeto: comparación profunda si tiene MetaModelo asociado
        if (mc?.meta && typeof v === "object" && v !== null && !Array.isArray(v)
            && typeof vi === "object" && vi !== null) {
            return modeloModificado(vi as Modelo, v as Modelo, mc.meta as MetaModelo<Modelo>);
        }
        // Lista: comparación profunda ítem a ítem si tiene itemMeta
        if (mc?.itemMeta && Array.isArray(v) && Array.isArray(vi)) {
            if (v.length !== vi.length) return true;
            return v.some((item, i) =>
                modeloModificado(
                    (vi as unknown[])[i] as Modelo,
                    item as Modelo,
                    mc.itemMeta as MetaModelo<Modelo>
                )
            );
        }
        // Primitivo: comparación por valor (comportamiento original)
        return v !== vi;
    });
}

// const aNumeroMoneda = (cantidad: number | string): number | null => {
//     if (typeof cantidad === "number") {
//         return Number.isFinite(cantidad) ? cantidad : null;
//     }

//     const limpio = cantidad
//         .trim()
//         .replace(/[^0-9,.-]/g, "")
//         .replace(/\s+/g, "");

//     if (!limpio) return null;

//     const hayComa = limpio.includes(",");
//     const hayPunto = limpio.includes(".");

//     const normalizado = hayComa && hayPunto
//         ? limpio.replace(/\./g, "").replace(/,/g, ".")
//         : hayComa
//             ? limpio.replace(/,/g, ".")
//             : limpio;

//     const numero = Number(normalizado);
//     return Number.isFinite(numero) ? numero : null;
// }

export const formatearMoneda = (cantidad: number | string, divisa: string): string => {
    // const numero = aNumeroMoneda(cantidad);
    const numero = Number(cantidad);
    if (isNaN(numero)) return "";

    const divisaValida = divisa && divisa.trim() ? divisa.trim().toUpperCase() : "EUR";
    const locale = divisaValida === "EUR" ? "es-ES" : "en-US";
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: divisaValida,
        useGrouping: "always",
    }).format(numero);
};

export const formatearNumero = (cantidad: number | string, decimales?: number): string => {
    const numero = Number(cantidad);
    if (isNaN(numero)) return "";
    const opciones: Intl.NumberFormatOptions = { useGrouping: true };
    if (decimales !== undefined) {
        opciones.minimumFractionDigits = decimales;
        opciones.maximumFractionDigits = decimales;
    }
    return new Intl.NumberFormat("es-ES", opciones).format(numero);
};

export const resolverDivisa = <T,>(
    divisa: string | ((entidad: T) => string) | undefined,
    entidad: T
): string | undefined => (typeof divisa === "function" ? divisa(entidad) : divisa);

function decimalesPorMoneda(divisa: string): number {
    const numberFormatUSD = new Intl.NumberFormat('en-US', {
        style: 'currency', currency: divisa
    });
    return numberFormatUSD.formatToParts(1)
        .find(part => part.type === "fraction")
        ?.value.length ?? 0;
}

export const redondeaMoneda = (cantidad: number, divisa: string): number => {
    const decimales = decimalesPorMoneda(divisa);
    return parseFloat(cantidad.toFixed(decimales));
};

export const formatearFechaString = (fecha: string): string => {
    if (!fecha) return fecha;
    const date = new Date(fecha);
    return formatearFechaDate(date);
};

export const formatearFechaDate = (date: Date): string => {
    if (!date) return date;

    return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

export const formatearFechaHoraString = (fechahora: string): string => {
    if (!fechahora) return fechahora;
    const date = new Date(fechahora);
    return formatearFechaHora(date);
};

export const formatearFechaHora = (date: Date): string => {
    return `${formatearFechaDate(date)} ${formatearHoraDate(date)}`;
};

export const formatearHoraString = (hora: string): string => {
    if (!hora) return hora;
    return hora.substring(0, 5); // "14:30:00" -> "14:30"
};

export const formatearHoraDate = (date: Date): string => {
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
};

export const formatearDireccionUnaLinea = (direccion: Direccion): string => {
    return `${direccion.tipo_via ? `${direccion.tipo_via} ` : ''} ${direccion.nombre_via ? `${direccion.nombre_via} ` : ''}, ${direccion.ciudad ? `${direccion.ciudad}` : ''}`;
};
export const calcularPaginacionSimplificada = (
    total: number | undefined,
    paginaActual: number,
    limite: number
) => {
    const totalPaginas = total ? Math.ceil(total / limite) : 0;

    if (totalPaginas <= 0) {
        return { paginasMostradas: [], totalPaginas: 0 };
    }

    // Para mostrar un máximo de 5 páginas alrededor de la página actual
    let inicio = Math.max(1, paginaActual - 2);
    let fin = Math.min(totalPaginas, paginaActual + 2);

    // Ajustar si no llegamos al máximo de páginas mostradas
    if (fin - inicio + 1 < 5) {
        if (paginaActual < 3) {
            fin = Math.min(totalPaginas, 5);
        } else {
            inicio = Math.max(1, totalPaginas - 4);
        }
    }

    const paginasMostradas = [];
    for (let i = inicio; i <= fin; i++) {
        paginasMostradas.push(i);
    }

    return { paginasMostradas, totalPaginas };
};

export const puedeAlguna = (regla: string | string[]): boolean =>
    Array.isArray(regla) ? regla.some(puede) : puede(regla);

/**
 * SaaS: prefijos de regla de los módulos que la empresa no tiene contratados
 * (`whoami.saas.modulos_bloqueados`, ver olula_servidor/apps/olula_saas). Fuera del
 * SaaS whoami no trae `saas` y no se bloquea nada.
 */
export const moduloBloqueado = (regla: string): boolean => {
    const raw = localStorage.getItem("whoami");
    if (!raw) return false;
    try {
        const whoAmI = JSON.parse(raw) as { saas?: { modulos_bloqueados?: string[] } | null };
        const bloqueados = whoAmI.saas?.modulos_bloqueados ?? [];
        return bloqueados.some((prefijo) => regla === prefijo || regla.startsWith(`${prefijo}.`));
    } catch {
        return false;
    }
};

/**
 * SaaS: la URL de una pantalla pertenece a un módulo no contratado. Se mira cada
 * tramo de la ruta (`/crm/contacto`, `/dashboard/crm`) frente a los prefijos de
 * regla bloqueados de un solo nivel (`crm`, `tpv`...). Sirve para las entradas
 * de menú sin regla, como los resúmenes de cada área.
 */
export const moduloBloqueadoEnUrl = (url: string): boolean => {
    const raw = localStorage.getItem("whoami");
    if (!raw) return false;
    try {
        const whoAmI = JSON.parse(raw) as { saas?: { modulos_bloqueados?: string[] } | null };
        const bloqueados = (whoAmI.saas?.modulos_bloqueados ?? []).filter((p) => !p.includes("."));
        if (!bloqueados.length) return false;
        const tramos = url.split("?")[0].split("/").filter(Boolean);
        return tramos.some((tramo) => bloqueados.includes(tramo));
    } catch {
        return false;
    }
};

export const puede = (regla: string): boolean => {
    if (regla === "Dashboard:visit" || regla === 'Home:visit') return true;
    if (moduloBloqueado(regla)) return false;

    // if (!regla) return true;
    // Busca el permiso exacto
    const permisos = JSON.parse(permisosGrupo.obtener() || "[]") as Permiso[];
    const permisoGeneral = permisos.find(p => p.id_regla === "general");

    const permisoExacto = permisos.find(p => p.id_regla === regla);
    if (permisoExacto) {
        if (permisoExacto.valor === true) return true;
        if (permisoExacto.valor === false) return false;
        // Si es null, sigue buscando
    }

    // Quita la última parte y busca permiso padre
    const partes = regla.split(".");
    let permisoPadre: Permiso | undefined;
    if (partes.length > 1) {
        const padre = partes.slice(0, -1).join(".");
        permisoPadre = permisos.find(p => p.id_regla === padre);
        if (permisoPadre) {
            if (permisoPadre.valor === true) return true;
            if (permisoPadre.valor === false) return false;
            // Si es null, sigue buscando
        }
    }

    // Solo consulta general si hubo alguna coincidencia parcial (null),
    // es decir, si la regla o su padre existen en la tabla pero están indecidos.
    // Si la regla es completamente desconocida, se permite por defecto.
    const hayCoincidenciaIndecisa =
        (permisoExacto !== undefined && permisoExacto.valor === null) ||
        (permisoPadre !== undefined && permisoPadre.valor === null);

    if (hayCoincidenciaIndecisa) {
        if (permisoGeneral) {
            if (permisoGeneral.valor === true) return true;
            if (permisoGeneral.valor === false) return false;
        }
    }

    // Si no hay ninguna coincidencia y general está denegado, deniega.
    if (permisoExacto === undefined && permisoPadre === undefined && permisoGeneral?.valor === false) {
        return false;
    }

    return true;
};

export const configuracion = (ruta: string): boolean => {
    const [contexto, clave] = ruta.split(".");
    if (!contexto || !clave) return false;

    const raw = localStorage.getItem("whoami");
    if (!raw) return false;

    try {
        const whoAmI = JSON.parse(raw) as {
            config?: Record<string, Record<string, boolean>>;
        };
        return whoAmI.config?.[contexto]?.[clave] === true;
    } catch {
        return false;
    }
};

export const plugin = (nombre: string): string => {
    if (!nombre) return "";

    const raw = localStorage.getItem("whoami");
    if (!raw) return "";

    try {
        const whoAmI = JSON.parse(raw) as { plugins?: Record<string, string> };
        const estado = whoAmI.plugins?.[nombre];
        return typeof estado === "string" ? estado.toLowerCase() : "";
    } catch {
        return "";
    }
};

type RelacionDeCampos = Record<string, string>;
export const transformarCriteria = (relacion: RelacionDeCampos): (criteria: Criteria) => Criteria => {

    const transformarClausula = (clausula: ClausulaFiltro): ClausulaFiltro =>
        clausula.with(0, relacion[clausula[0]] ?? clausula[0]) as ClausulaFiltro;

    // const transformarFiltro = (filtro: Filtro): Filtro => {
    //     if (Array.isArray(filtro)) return filtro.map(transformarClausula);
    //     if ('or' in filtro) return { or: filtro.or.map(transformarFiltro) };
    //     return { and: filtro.and.map(transformarFiltro) };
    // };
    const transformarFiltro = (filtro: Filtro): Filtro => {
        if (Array.isArray(filtro) && filtro.length === 0) return filtro;
        if (Array.isArray(filtro) && Array.isArray(filtro[0])) return (filtro as ClausulaFiltro[]).map(transformarClausula);
        if (Array.isArray(filtro)) return transformarClausula(filtro as ClausulaFiltro);
        if ('or' in filtro) return { or: filtro.or.map(transformarFiltro) };
        return { and: filtro.and.map(transformarFiltro) };
    };
    const transformarOrden = (orden: Orden): Orden => orden.with(0, relacion[orden[0]] ?? orden[0]) as Orden;

    return (criteria) => ({
        filtro: transformarFiltro(criteria.filtro),
        orden: transformarOrden(criteria.orden),
        paginacion: criteria.paginacion
    })
};

type ProcesarContextoSinc<E extends string, C extends Contexto<E>> = (contexto: C) => C;
export const setEstadoMaquina: <E extends string, C extends Contexto<E>>(nuevoEstado: string) => ProcesarContextoSinc<E, C> = (nuevoEstado) => {

    return (contexto) => {
        return {
            ...contexto,
            estado: nuevoEstado
        }
    }
}

export const criteriaDefecto: Criteria = {
    filtro: [...filtroDefecto],
    orden: [...ordenDefecto],
    paginacion: { ...paginacionDefecto },
};

export const ejecutarListaProcesos = async <E extends string, C extends Contexto<E>>(
    contexto: C,
    procesos: (ProcesarContexto<E, C> | E)[],
    payload?: unknown
): Promise<[C, EventoMaquina[]]> => {

    const eventos: EventoMaquina[] = [];

    let x: [C, EventoMaquina[]] = [contexto, eventos];
    for (const proceso of procesos) {
        if (typeof proceso === 'string') {
            x = [
                {
                    ...x[0],
                    estado: proceso
                },
                x[1]
            ]
        } else {
            const resultado = await proceso(x[0], payload);
            if (Array.isArray(resultado)) {
                x = [resultado[0], [...x[1], ...resultado[1]]];
            } else {
                x = [resultado, x[1]];
            }
        }
    }
    return x;
}

export const procesarEvento = async <E extends string, C extends Contexto<E>>(
    maquina: Maquina<E, C>,
    contexto: C,
    evento: string,
    payload: unknown,
): Promise<[C, EventoMaquina[]]> => {

    const estado = contexto.estado;

    console.log("Procesar evento:", evento, payload, 'estado actual', estado);

    const usarMaquina = () => {

        return maquina[contexto.estado][evento];
    }

    const respuesta = usarMaquina();

    if (typeof respuesta === 'string') {

        return [{ ...contexto, estado: respuesta }, []];

    } else if (typeof respuesta === 'function') {

        return ejecutarListaProcesos(contexto, [respuesta], payload);

    } else if (Array.isArray(respuesta)) {

        return ejecutarListaProcesos(contexto, respuesta, payload);

    } else {
        throw new Error(
            `No se pudo procesar el evento ${evento} en el estado ${estado}.`
        );
    }
};

export const publicar = <E extends string, C extends Contexto<E>>(evento: string, payload?: ((c: C, np: unknown) => unknown) | null | string | Entidad) => {

    const f: ProcesarContexto<E, C> = async (contexto, new_payload) => {
        const valorPayload = payload && typeof payload === 'function'
            ? payload(contexto, new_payload)
            : payload;

        return [contexto, [[evento, valorPayload]]]
    }

    return f
}
