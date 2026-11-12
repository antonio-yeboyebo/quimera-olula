import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { preferencias } from "@olula/lib/preferencias.ts";
import { borrarVista as borrarVistaApi, cambiarVista, crearVista, getVista, getVistas } from "../../../vista/infraestructura.ts";
import { CargaTerminada, Cubo, Miembro, PeticionPivot, Presentacion } from "../../diseño.ts";
import {
    alternarNodo as alternarNodoArbol,
    apilar,
    arbolDesdePivot,
    etiquetarMeses,
    existeNodo,
    expandirNodo,
    historialNuevo,
    moverHistorial,
    necesitaCargar,
    nombreExportacion,
    peticionInicial,
    peticionNodo,
    rutasExpandidas,
} from "../../dominio.ts";
import { exportarPivot, getCatalogo, postPivot, postRecarga } from "../../infraestructura.ts";
import { ContextoNavegador, EstadoNavegador } from "./diseño.ts";

type ProcesarNavegador = ProcesarContexto<EstadoNavegador, ContextoNavegador>;

const PREFERENCIA_CUBO = "analisis.cubo";

const PRESENTACION_INICIAL: Presentacion = { medidasEnColumnas: true, verGrafico: false, tipoGrafico: "barras" };

export const contextoNavegadorInicial: ContextoNavegador = {
    estado: "CARGANDO",
    cubos: [],
    cubo: null,
    peticion: null,
    presentacion: PRESENTACION_INICIAL,
    arbol: null,
    truncado: false,
    historial: null,
    vistas: [],
    vista: null,
};

const consultar = async (ctx: ContextoNavegador, cubo: Cubo, peticion: PeticionPivot): Promise<ContextoNavegador> => {
    const resultado = await postPivot(cubo.id, peticionNodo(peticion, []));
    return {
        ...ctx,
        estado: "NAVEGANDO",
        cubo,
        peticion,
        arbol: arbolDesdePivot(etiquetarMeses(cubo, peticion, resultado.filas)),
        truncado: resultado.truncado,
    };
};

const abrir = async (
    ctx: ContextoNavegador,
    cubo: Cubo,
    peticion: PeticionPivot,
    presentacion: Presentacion
): Promise<ContextoNavegador> => {
    const vistas = cubo.id === ctx.cubo?.id ? ctx.vistas : await getVistas(cubo.id);
    return consultar({ ...ctx, vistas, presentacion, historial: historialNuevo(peticion) }, cubo, peticion);
};

export const cargarCatalogo: ProcesarNavegador = async (ctx) => {
    const cubos = await getCatalogo();
    if (cubos.length === 0) return { ...ctx, estado: "SIN_CUBOS", cubos };
    const preferido = preferencias.get<string | null>(PREFERENCIA_CUBO, null);
    const cubo = cubos.find((c) => c.id === preferido) ?? cubos[0];
    return abrir({ ...ctx, cubos }, cubo, peticionInicial(cubo), PRESENTACION_INICIAL);
};

export const cambiarCubo: ProcesarNavegador = async (ctx, payload) => {
    const cubo = ctx.cubos.find((c) => c.id === payload);
    if (!cubo || cubo.id === ctx.cubo?.id) return ctx;
    preferencias.set(PREFERENCIA_CUBO, cubo.id);
    return abrir({ ...ctx, vista: null }, cubo, peticionInicial(cubo), PRESENTACION_INICIAL);
};

export const cambiarPeticion: ProcesarNavegador = async (ctx, payload) => {
    const peticion = payload as PeticionPivot;
    if (!ctx.cubo || !ctx.historial) return ctx;
    return consultar({ ...ctx, historial: apilar(ctx.historial, peticion) }, ctx.cubo, peticion);
};

const recorrerHistorial = (paso: -1 | 1): ProcesarNavegador => async (ctx) => {
    if (!ctx.cubo || !ctx.historial) return ctx;
    const historial = moverHistorial(ctx.historial, paso);
    if (historial === ctx.historial) return ctx;
    return consultar({ ...ctx, historial }, ctx.cubo, historial.peticiones[historial.posicion]);
};

export const irAtras = recorrerHistorial(-1);

export const irAdelante = recorrerHistorial(1);

export const cambiarPresentacion: ProcesarNavegador = async (ctx, payload) => ({
    ...ctx,
    presentacion: { ...ctx.presentacion, ...(payload as Partial<Presentacion>) },
});

const expandir = async (ctx: ContextoNavegador, ruta: Miembro[]): Promise<ContextoNavegador> => {
    const { cubo, peticion, arbol } = ctx;
    if (!cubo || !peticion || !arbol) return ctx;
    const resultado = await postPivot(cubo.id, peticionNodo(peticion, ruta));
    return {
        ...ctx,
        arbol: expandirNodo(arbol, ruta, etiquetarMeses(cubo, peticion, resultado.filas)),
        truncado: ctx.truncado || resultado.truncado,
    };
};

export const alternarNodo: ProcesarNavegador = async (ctx, payload) => {
    const ruta = payload as Miembro[];
    if (!ctx.arbol) return ctx;
    if (!necesitaCargar(ctx.arbol, ruta)) return { ...ctx, arbol: alternarNodoArbol(ctx.arbol, ruta) };
    return expandir(ctx, ruta);
};

export const exportar: ProcesarNavegador = async (ctx) => {
    if (!ctx.cubo || !ctx.peticion) return ctx;
    const fichero = await exportarPivot(ctx.cubo.id, ctx.peticion);
    await descargarDocumento(fichero, nombreExportacion(ctx.cubo.id, new Date()));
    return ctx;
};

const conCatalogo = async (ctx: ContextoNavegador): Promise<ContextoNavegador> => {
    const cubos = await getCatalogo();
    return { ...ctx, cubos, cubo: cubos.find((c) => c.id === ctx.cubo?.id) ?? ctx.cubo };
};

export const refrescarCatalogo: ProcesarNavegador = conCatalogo;

export const recargar: ProcesarNavegador = async (ctx, payload) => {
    if (!ctx.cubo) return ctx;
    await postRecarga(ctx.cubo.id, payload as string[]);
    return conCatalogo(ctx);
};

export const cargaTerminada: ProcesarNavegador = async (ctx, payload) => {
    const carga = payload as CargaTerminada;
    const refrescado = await conCatalogo(ctx);
    const { cubo, peticion, arbol } = refrescado;
    if (carga.estado !== "ok" || carga.cuboId !== cubo?.id || !peticion || !arbol) return refrescado;
    let nuevo = await consultar(refrescado, cubo, peticion);
    for (const ruta of rutasExpandidas(arbol)) {
        if (nuevo.arbol && existeNodo(nuevo.arbol, ruta)) nuevo = await expandir(nuevo, ruta);
    }
    return nuevo;
};

export const abrirVista: ProcesarNavegador = async (ctx, payload) => {
    const vista = await getVista(payload as string);
    const cubo = ctx.cubos.find((c) => c.id === vista.cuboId);
    if (!cubo) return ctx;
    const { peticion, presentacion, ...resumen } = vista;
    return abrir({ ...ctx, vista: resumen }, cubo, peticion, { ...PRESENTACION_INICIAL, ...presentacion });
};

export const cerrarVista: ProcesarNavegador = async (ctx) => ({ ...ctx, vista: null });

const conVistas = async (ctx: ContextoNavegador, vistaId: string | null): Promise<ContextoNavegador> => {
    if (!ctx.cubo) return ctx;
    const vistas = await getVistas(ctx.cubo.id);
    return { ...ctx, vistas, vista: vistas.find((v) => v.id === vistaId) ?? null };
};

export const guardarVista: ProcesarNavegador = async (ctx) => {
    if (!ctx.vista || !ctx.peticion) return ctx;
    await cambiarVista(ctx.vista.id, { peticion: ctx.peticion, presentacion: ctx.presentacion });
    return conVistas(ctx, ctx.vista.id);
};

export const guardarVistaComo: ProcesarNavegador = async (ctx, payload) => {
    if (!ctx.cubo || !ctx.peticion) return ctx;
    const id = await crearVista({
        cuboId: ctx.cubo.id,
        nombre: payload as string,
        peticion: ctx.peticion,
        presentacion: ctx.presentacion,
    });
    return conVistas(ctx, id);
};

export const borrarVista: ProcesarNavegador = async (ctx) => {
    if (!ctx.vista) return ctx;
    await borrarVistaApi(ctx.vista.id);
    return conVistas(ctx, null);
};
