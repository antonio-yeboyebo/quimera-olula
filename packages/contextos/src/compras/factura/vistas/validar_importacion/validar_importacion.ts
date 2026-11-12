import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { proponerImportacion } from "../../infraestructura.ts";
import { cambiarLinea } from "./dominio.ts";
import {
    ArticuloCreadoImportacion,
    ContextoValidarImportacion,
    EstadoValidarImportacion,
    FacturaLeida,
} from "./diseño.ts";

type ProcesarValidar = ProcesarContexto<EstadoValidarImportacion, ContextoValidarImportacion>;

/** Pide la propuesta al servidor y adopta su factura leída (lleva las asignaciones de albarán). */
export const proponer: ProcesarValidar = async (ctx) => {
    const propuesta = await proponerImportacion(ctx.facturaLeida);
    const nueva = propuesta.facturaLeida;
    const mismoProveedor = nueva.proveedorId === ctx.facturaLeida.proveedorId;
    const facturaLeida: FacturaLeida = {
        ...nueva,
        proveedorNombre:
            nueva.proveedorNombre ??
            (mismoProveedor ? ctx.facturaLeida.proveedorNombre : null),
    };
    return { ...ctx, propuesta, facturaLeida, sucia: false };
};

export const reproponerSiSucia: ProcesarValidar = async (ctx, payload) =>
    ctx.sucia ? proponer(ctx, payload) : ctx;

/** Edición local (sin pasar por el servidor). */
export const editarLeida: ProcesarValidar = async (ctx, payload) => ({
    ...ctx,
    facturaLeida: payload as FacturaLeida,
    sucia: true,
});

/** Cambio que invalida la propuesta: se guarda y se vuelve a proponer. */
export const guardarLeida: ProcesarValidar = async (ctx, payload) => ({
    ...ctx,
    facturaLeida: payload as FacturaLeida,
});

export const iniciarCreacionArticulo: ProcesarValidar = async (ctx, payload) => ({
    ...ctx,
    lineaArticulo: payload as number,
});

export const aplicarArticuloCreado: ProcesarValidar = async (ctx, payload) => {
    const { articuloId, descripcion } = payload as ArticuloCreadoImportacion;
    if (ctx.lineaArticulo === null) return ctx;
    return {
        ...ctx,
        facturaLeida: cambiarLinea(ctx.facturaLeida, ctx.lineaArticulo, {
            articuloId,
            descripcion,
        }),
        lineaArticulo: null,
    };
};

export const limpiarLineaArticulo: ProcesarValidar = async (ctx) => ({
    ...ctx,
    lineaArticulo: null,
});
