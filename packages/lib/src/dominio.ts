// import { UiProps, ValorControl } from "useModelo.ts";
import { Permiso, permisosGrupo } from "./api/permisos.ts";
import { ClausulaFiltro, Contexto, Criteria, Direccion, Entidad, EventoMaquina, Filtro, Maquina, Modelo, Orden, ProcesarContexto, TipoInput, ValorCampoUI } from "./diseño.ts";
import { UiProps, ValorControl } from "./useModelo.ts";

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
    requerido?: boolean;
    bloqueado?: boolean;
    validacion?: (modelo: T) => string | boolean;
    positivo?: boolean
    divisa?: string
    decimales?: number
    maximo?: number
    minimo?: number
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
        case 'fecha': {
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
        case 'fecha': {
            // Convertir fecha a formato ISO local (YYYY-MM-DD) respetando zona horaria
            const fecha = valor as Date;
            const año = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const dia = String(fecha.getDate()).padStart(2, '0');
            return `${año}-${mes}-${dia}`;
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
    onModeloListo?: (modelo: M) => Promise<void>
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
        const campos = meta.campos || {};
        const tipoCampo = campo in campos && campos[campo]?.tipo
            ? campos[campo].tipo
            : "texto";

        const conversionTipo = {
            "boolean": "checkbox",
            "dolar": "moneda",
        };

        const tipo = (conversionTipo[tipoCampo as keyof typeof conversionTipo] || tipoCampo) as TipoInput;
        const valorUI = convertirCampoHaciaUI(meta)(campo, valor);

        return {
            nombre: campo,
            valor: valorUI,
            tipo: tipo,
            deshabilitado: !editable,
            valido: cambiado && valido,
            erroneo: !valido,
            advertido: false,
            textoValidacion: textoValidacion,
            onChange: setCampo(modelo, meta, onModeloCambiado, campo, secundario),
            evaluarCambio: evaluarCambio(modelo, modeloInicial, meta, onModeloListo),
            descripcion: secundario ? modelo[secundario] as string : undefined,
        }
    }

const evaluarCambio = <M extends Modelo>(
    modelo: M,
    modeloInicial: M,
    meta: MetaModelo<M>,
    onModeloListo?: (modelo: M) => Promise<void>
) =>
    async () => {
        if (!onModeloListo) {
            return;
        }
        if (modeloModificado(modeloInicial, modelo) && modeloEsValido(meta)(modelo)) {
            await onModeloListo(modelo);
        }
    }

const setCampo = <M extends Modelo>(
    modelo: M,
    meta: MetaModelo<M>,
    onModeloCambiado: (modelo: M) => void,
    campo: string,
    segundo?: string
) => async (_valor: ValorControl): Promise<void> => {

    let valor = _valor || null;
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

    let nuevoModelo = {
        ...modelo,
        [campo]: valorModelo,
    } as M
    if (segundo && descripcion) {
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
    console.log('validacionCampoModelo', campo);
    const campos = meta.campos || {};
    const valor = modelo[campo];
    const tipoCampo = campos[campo]?.tipo;

    if (campo.split(',').length > 1) {
        campo = campo.split(',')[0].trim();
    }
    const requerido = campo in campos && campos[campo]?.requerido

    if (requerido && (valor === null || valor === undefined)) {
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
    return modeloModificado(estado.valor_inicial, estado.valor) && modeloEsValido(meta)(estado.valor);
}

export const getFormProps = <M extends Modelo>(
    modelo: M,
    modeloInicial: M,
    meta: MetaModelo<M>,
    onModeloCambiado: (modelo: M) => void,
    onModeloListo?: (modelo: M) => Promise<void>
): FormModelo => {
    return {
        uiProps: getUiProps(
            modelo,
            modeloInicial,
            meta,
            onModeloCambiado,
            onModeloListo
        ),
        modificado: modeloModificado(modeloInicial, modelo),
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

export const modeloModificado = <T extends Modelo>(valor_inicial: T, valor: T) => {

    Object.keys(valor).some((k) => valor[k] !== valor_inicial[k])

    // console.log('modeloModificado2', Object.keys(valor).filter((k) => valor[k] !== valor_inicial[k]));

    return (
        Object.keys(valor).some((k) => valor[k] !== valor_inicial[k])
    )
}

export const formatearMoneda = (cantidad: number, divisa: string): string => {
    const divisaValida = divisa && divisa.trim() ? divisa.trim().toUpperCase() : "EUR";
    const locale = divisaValida === "EUR" ? "es-ES" : "en-US";
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: divisaValida,
    }).format(cantidad);
};

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

export const puede = (regla: string): boolean => {
    if (!regla) return true;
    // Busca el permiso exacto
    const permisos = JSON.parse(permisosGrupo.obtener() || "[]") as Permiso[];

    const permisoExacto = permisos.find(p => p.id_regla === regla);
    if (permisoExacto) {
        if (permisoExacto.valor === true) return true;
        if (permisoExacto.valor === false) return false;
        // Si es null, sigue buscando
    }

    // Quita la última parte y busca
    const partes = regla.split(".");
    if (partes.length > 1) {
        const padre = partes.slice(0, -1).join(".");
        const permisoPadre = permisos.find(p => p.id_regla === padre);
        if (permisoPadre) {
            if (permisoPadre.valor === true) return true;
            if (permisoPadre.valor === false) return false;
            // Si es null, sigue buscando
        }
    }

    // Busca permiso general
    const permisoGeneral = permisos.find(p => p.id_regla === "general");
    if (permisoGeneral) {
        if (permisoGeneral.valor === true) return true;
        if (permisoGeneral.valor === false) return false;
    }

    return true;
};

type RelacionDeCampos = Record<string, string>;
export const transformarCriteria = (relacion: RelacionDeCampos): (criteria: Criteria) => Criteria => {

    const transformarClausula = (clausula: ClausulaFiltro): ClausulaFiltro =>
        clausula.with(0, relacion[clausula[0]] ?? clausula[0]) as ClausulaFiltro;

    const transformarFiltro = (filtro: Filtro): Filtro => filtro.map(transformarClausula);

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
    filtro: [],
    orden: ["id", "DESC"],
    paginacion: { limite: 10, pagina: 1 },
}

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
