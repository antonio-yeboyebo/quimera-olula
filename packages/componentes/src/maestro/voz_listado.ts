import type {
    CampoFiltroVoz, DescripcionListado, ResultadoAccionPantalla, TipoCampoVoz,
} from "@olula/lib/controles_pantalla.ts";
import { ClausulaFiltro, Criteria, Entidad } from "@olula/lib/diseño.ts";
import { MetaTabla, obtenerCols } from "../atomos/qtablacontrolada.tsx";
import { filtroToValores, MetaCampoFiltro, MetaFiltro } from "./maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { tComponentes } from "../i18n/textos.ts";

/**
 * Listado manejado por voz (ver controles_pantalla.ts en @olula/lib): qué se describe
 * de él y cómo se traduce cada acción a los mismos callbacks que usa la UI.
 * Puro (sin React) para poder probarlo aparte.
 */

const MAX_FILAS_DESCRITAS = 10;
const MAX_TEXTO_FILA = 120;

const tipoCampoVoz = (meta: MetaCampoFiltro): TipoCampoVoz | null => {
    switch (meta.tipo as string | undefined) {
        case "checkbox":
            return "booleano";
        case "intervalo_fechas":
            return "fechas";
        case "intervalo_numeros":
            return "numeros";
        case "mes_año":
            return "mes";
        case "multiseleccion":
        case "select":
            return meta.opciones?.length ? "opciones" : null;
        case "texto":
            return "texto";
        case undefined:
            // Sin tipo y con render propio no se sabe qué forma tiene el valor.
            return meta.render ? null : "texto";
        default:
            return null;
    }
};

export const camposFiltroVoz = (metaFiltro: MetaFiltro): CampoFiltroVoz[] =>
    Object.values(metaFiltro).flatMap(meta => {
        const tipo = tipoCampoVoz(meta);
        if (!tipo) return [];
        return [{
            id: meta.id,
            etiqueta: meta.label,
            tipo,
            ...(tipo === "opciones"
                ? { opciones: (meta.opciones ?? []).map(o => ({ valor: String(o.valor), etiqueta: String(o.descripcion) })) }
                : {}),
        }];
    });

const textoValor = (valor: unknown): string => {
    if (valor === null || valor === undefined) return "";
    if (typeof valor === "object") return "";
    return String(valor);
};

/** Resumen legible de una fila: los valores de las primeras columnas. */
export const textoFila = <T extends Entidad>(entidad: T, metaTabla?: MetaTabla<T>): string => {
    const columnas = metaTabla ? obtenerCols(metaTabla).filter(c => c.id !== "id") : [];
    const valores = columnas.length
        ? columnas.map(c => textoValor((entidad as Record<string, unknown>)[c.id]))
        : Object.entries(entidad).filter(([k]) => k !== "id").map(([, v]) => textoValor(v));
    return valores.filter(Boolean).slice(0, 4).join(" · ").slice(0, MAX_TEXTO_FILA);
};

export const describirListado = <T extends Entidad>(datos: {
    metaTabla?: MetaTabla<T>;
    metaFiltro: MetaFiltro;
    criteria: Criteria;
    entidades: T[];
    totalEntidades: number;
    seleccionada?: string;
    modo: string | null;
    modos: string[];
}): Omit<DescripcionListado, "id"> => {
    const { metaTabla, metaFiltro, criteria, entidades, seleccionada } = datos;
    const filaSeleccionada = seleccionada ? entidades.find(e => e.id === seleccionada) : undefined;
    return {
        tipo: "listado",
        campos: camposFiltroVoz(metaFiltro),
        columnasOrden: metaTabla
            ? obtenerCols(metaTabla).map(c => ({ id: c.id, etiqueta: c.cabecera }))
            : [],
        filtro: criteria.filtro as ClausulaFiltro[],
        orden: criteria.orden as string[],
        pagina: criteria.paginacion.pagina,
        total: datos.totalEntidades,
        filas: entidades.slice(0, MAX_FILAS_DESCRITAS).map((e, i) => ({
            posicion: i + 1, id: e.id, texto: textoFila(e, metaTabla),
        })),
        seleccionada: seleccionada
            ? { id: seleccionada, texto: filaSeleccionada ? textoFila(filaSeleccionada, metaTabla) : null }
            : null,
        modo: datos.modo,
        modos: datos.modos,
    };
};

// ---------------------------------------------------------------------------
// Valores de filtro dictados → valores del panel de filtros
// ---------------------------------------------------------------------------

const fechaLocal = (texto: unknown): Date | undefined => {
    if (typeof texto !== "string") return undefined;
    const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
    if (!coincidencia) return undefined;
    const [, a, m, d] = coincidencia.map(Number);
    return new Date(a, m - 1, d);
};

const numero = (valor: unknown): number | undefined => {
    const n = typeof valor === "number" ? valor : typeof valor === "string" ? Number(valor.replace(",", ".")) : NaN;
    return Number.isFinite(n) ? n : undefined;
};

const VERDADEROS = new Set([true, "true", "si", "sí", "1"]);
const FALSOS = new Set([false, "false", "no", "0"]);

/** Valor dictado (forma "simple": texto, {desde, hasta}…) → el valor que espera el
 * `filtro` del MetaCampoFiltro, el mismo que produciría su input. undefined = no
 * válido. */
export const valorFiltroDesdeVoz = (meta: MetaCampoFiltro, valor: unknown): unknown => {
    switch (tipoCampoVoz(meta)) {
        case "texto":
            return typeof valor === "string" && valor.trim() ? valor.trim() : undefined;
        case "booleano":
            return VERDADEROS.has(valor as never) ? true : FALSOS.has(valor as never) ? false : undefined;
        case "fechas": {
            const { desde, hasta } = (valor ?? {}) as { desde?: unknown; hasta?: unknown };
            const rango = [fechaLocal(desde), fechaLocal(hasta)];
            return rango.some(Boolean) ? rango : undefined;
        }
        case "numeros": {
            const { desde, hasta } = (valor ?? {}) as { desde?: unknown; hasta?: unknown };
            const rango = [numero(desde), numero(hasta)];
            return rango.some(v => v !== undefined) ? rango : undefined;
        }
        case "mes":
            return typeof valor === "string" && /^\d{4}-\d{2}$/.test(valor) ? valor : undefined;
        case "opciones": {
            const validas = new Set((meta.opciones ?? []).map(o => String(o.valor)));
            const elegidas = (Array.isArray(valor) ? valor : [valor]).map(String).filter(v => validas.has(v));
            if (!elegidas.length) return undefined;
            return (meta.tipo as string) === "multiseleccion" ? elegidas : elegidas[0];
        }
        default:
            return undefined;
    }
};

/** Nuevo filtro tras fijar (o quitar, con valor null) los campos dictados — por el
 * mismo camino que el panel de filtros (filtroToValores → filtro de cada campo), y
 * conservando las cláusulas que no pertenecen a ningún campo del panel. */
export const aplicarFiltrosVoz = (
    filtroActual: ClausulaFiltro[],
    metaFiltro: MetaFiltro,
    cambios: { campo: string; valor: unknown }[],
): { filtro: ClausulaFiltro[] } | { error: string } => {
    const valores = filtroToValores(filtroActual, metaFiltro);
    for (const { campo, valor } of cambios) {
        const meta = metaFiltro[campo];
        if (!meta) return { error: tComponentes("ui.maestro.noHayNingunFiltroCampoEn", { campo }) };
        if (valor === null || valor === undefined) {
            valores[campo] = meta.valorDefecto;
            continue;
        }
        const convertido = valorFiltroDesdeVoz(meta, valor);
        if (convertido === undefined) return { error: tComponentes("ui.maestro.noEntiendoEseValorParaLabel", { label: meta.label }) };
        valores[campo] = convertido;
    }

    const camposDelPanel = new Set(Object.values(metaFiltro).map(m => m.campo ?? m.id));
    const ajenas = filtroActual.filter(([campoApi]) => !camposDelPanel.has(campoApi));
    const delPanel = Object.entries(valores).flatMap(([id, valor]) => {
        if (!metaFiltro[id] || valor === undefined || valor === null) return [];
        const clausula = metaFiltro[id].filtro(valor);
        return clausula ? [clausula] : [];
    });
    return { filtro: [...ajenas, ...delPanel] };
};

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------

export interface ManejadoresListadoVoz<T extends Entidad> {
    metaTabla?: MetaTabla<T>;
    metaFiltro: MetaFiltro;
    criteria: Criteria;
    /** Filtro de partida del listado: "quitar los filtros" vuelve a él, como el botón
     * Limpiar del panel. */
    filtroInicial: ClausulaFiltro[];
    entidades: T[];
    totalEntidades: number;
    seleccionada?: string;
    modos: string[];
    onCriteriaChanged: (criteria: Criteria) => void;
    onSeleccion: (id: string) => void;
    cambiarModo: (modo: string) => void;
}

const ok = (mensaje: string): ResultadoAccionPantalla => ({ ok: true, mensaje });
const fallo = (mensaje: string): ResultadoAccionPantalla => ({ ok: false, mensaje });

export const ejecutarAccionListado = <T extends Entidad>(
    m: ManejadoresListadoVoz<T>, accion: string, parametros: Record<string, unknown>,
): ResultadoAccionPantalla => {
    const { criteria } = m;
    const primeraPagina = { ...criteria.paginacion, pagina: 1 };

    switch (accion) {
        case "filtrar": {
            const filtros = Array.isArray(parametros.filtros) ? parametros.filtros : [parametros];
            const cambios = (filtros as { campo?: unknown; valor?: unknown }[])
                .filter(f => typeof f?.campo === "string")
                .map(f => ({ campo: f.campo as string, valor: f.valor }));
            if (!cambios.length) return fallo(tComponentes("ui.maestro.noSePorQueCampoFiltrar"));
            const resultado = aplicarFiltrosVoz(criteria.filtro as ClausulaFiltro[], m.metaFiltro, cambios);
            if ("error" in resultado) return fallo(resultado.error);
            m.onCriteriaChanged({ ...criteria, filtro: resultado.filtro, paginacion: primeraPagina });
            return ok(tComponentes("ui.maestro.filtrado"));
        }
        case "quitar_filtros": {
            if (typeof parametros.campo === "string") {
                const resultado = aplicarFiltrosVoz(
                    criteria.filtro as ClausulaFiltro[], m.metaFiltro, [{ campo: parametros.campo, valor: null }]);
                if ("error" in resultado) return fallo(resultado.error);
                m.onCriteriaChanged({ ...criteria, filtro: resultado.filtro, paginacion: primeraPagina });
                return ok(tComponentes("ui.maestro.filtroQuitado"));
            }
            m.onCriteriaChanged({ ...criteria, filtro: m.filtroInicial, paginacion: primeraPagina });
            return ok(tComponentes("ui.maestro.filtrosQuitados"));
        }
        case "ordenar": {
            const campo = parametros.campo;
            const columnas = m.metaTabla ? obtenerCols(m.metaTabla).map(c => c.id) : [];
            if (typeof campo !== "string" || !columnas.includes(campo)) return fallo(tComponentes("ui.maestro.noPuedoOrdenarPorEseCampo"));
            const direccion = parametros.direccion === "ASC" ? "ASC" : "DESC";
            m.onCriteriaChanged({ ...criteria, orden: [campo, direccion], paginacion: primeraPagina });
            return ok(tComponentes("ui.maestro.ordenado"));
        }
        case "pagina": {
            const limite = criteria.paginacion.limite || 1;
            const ultima = Math.max(1, Math.ceil(m.totalEntidades / limite));
            const actual = criteria.paginacion.pagina;
            const pedida = parametros.pagina === "siguiente" ? actual + 1
                : parametros.pagina === "anterior" ? actual - 1
                : numero(parametros.pagina);
            if (pedida === undefined || pedida < 1 || pedida > ultima) return fallo(tComponentes("ui.maestro.noHayMasPaginas"));
            m.onCriteriaChanged({ ...criteria, paginacion: { ...criteria.paginacion, pagina: Math.trunc(pedida) } });
            return ok(tComponentes("ui.maestro.paginaTrunc", { trunc: Math.trunc(pedida) }));
        }
        case "seleccionar": {
            let destino: T | undefined;
            if (typeof parametros.id === "string") {
                destino = m.entidades.find(e => e.id === parametros.id);
            } else if (parametros.relativa === "siguiente" || parametros.relativa === "anterior") {
                const indice = m.entidades.findIndex(e => e.id === m.seleccionada);
                destino = m.entidades[parametros.relativa === "siguiente" ? indice + 1 : Math.max(indice, 1) - 1];
            } else {
                const posicion = numero(parametros.posicion);
                destino = posicion === undefined ? undefined : m.entidades[posicion - 1];
            }
            if (!destino) return fallo(tComponentes("ui.maestro.noEncuentroEseRegistroEnLa"));
            m.onSeleccion(destino.id);
            const texto = textoFila(destino, m.metaTabla);
            return ok(texto ? tComponentes("ui.maestro.abroValor", { valor: texto.split(" · ")[0] }) : tComponentes("ui.maestro.abierto"));
        }
        case "modo": {
            const modo = parametros.modo;
            if (typeof modo !== "string" || !m.modos.includes(modo)) return fallo(tComponentes("ui.maestro.esaVistaNoEstaDisponible"));
            m.cambiarModo(modo);
            return ok(tComponentes("ui.maestro.vistaDeModo", { modo }));
        }
        default:
            return fallo(tComponentes("ui.maestro.noSeHacerEsoEnEsta"));
    }
};
