import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { fechaIso } from "../comun/dominio.ts";
import { posicionActual } from "../comun/geolocalizacion.ts";
import { rutasSmartsales } from "../comun/rutas.ts";
import { CambioVisita, ContextoVisita, EstadoVisita, FinalizacionAPI, TareaVisita } from "./diseño.ts";
import {
    cerrarTrato,
    finalizarTarea,
    getCausasPerdida,
    getContactosCliente,
    getTareaVisita,
    iniciarVisita,
    quedanTareasPendientes,
} from "./infraestructura.ts";

type ProcesarVisita = ProcesarContexto<EstadoVisita, ContextoVisita>;

export const MAX_NOTA = 1000;

export const contextoInicial: ContextoVisita = {
    estado: "CARGANDO",
    tarea: null,
    contactos: [],
    causas: [],
    nota: "",
    interlocutor: null,
    horaFin: "",
    siguientePaso: "ninguno",
    generarSiguiente: false,
    estadoTrato: null,
    idCausa: null,
    tratoCerrado: false,
    errores: [],
};

export const horaActual = (ahora: Date = new Date()) =>
    `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;

export const estadoSegunTarea = (tarea: TareaVisita): EstadoVisita => {
    if (tarea.completada) return "TERMINADA";
    return tarea.enCurso ? "EN_CURSO" : "PENDIENTE";
};

export const esVisita = (tarea: TareaVisita | null) => tarea?.tipo === "Cita";

export const erroresFinalizacion = (ctx: ContextoVisita): string[] =>
    [
        !ctx.horaFin && "Indica la hora de fin",
        ctx.nota.length > MAX_NOTA && `La nota no puede pasar de ${MAX_NOTA} caracteres`,
    ].filter((e): e is string => !!e);

export const erroresCierreTrato = (ctx: ContextoVisita): string[] =>
    [
        !ctx.estadoTrato && "Indica si el trato se ha ganado o perdido",
        ctx.estadoTrato === "Perdido" && !ctx.idCausa && "Indica la causa de la pérdida",
    ].filter((e): e is string => !!e);

export const finalizacionParaAPI = (
    ctx: ContextoVisita,
    posicion: { latitud: number; longitud: number } | null,
    hoy: Date = new Date()
): FinalizacionAPI => ({
    completada: true,
    fechafin: ctx.tarea?.fechaInicio ?? fechaIso(hoy),
    horafin: ctx.horaFin.length === 5 ? `${ctx.horaFin}:00` : ctx.horaFin,
    latitudfin: posicion?.latitud ?? null,
    longitudfin: posicion?.longitud ?? null,
    nota: ctx.nota,
    interlocutor: ctx.interlocutor,
});

export const destinoAlTerminar = (ctx: ContextoVisita): string => {
    const tarea = ctx.tarea;
    if (tarea?.idTrato && ctx.siguientePaso !== "ninguno") return rutasSmartsales.trato(tarea.idTrato);
    if (ctx.generarSiguiente && tarea?.codCliente) {
        return rutasSmartsales.nuevaTareaPara(tarea.codCliente, ctx.tratoCerrado ? null : tarea.idTrato);
    }
    return rutasSmartsales.agenda;
};

export const cargarProceso: ProcesarVisita = async (_ctx, payload) => {
    const tarea = await getTareaVisita(String(payload));
    const contactos = tarea.codCliente ? await getContactosCliente(tarea.codCliente) : [];
    return {
        ...contextoInicial,
        estado: estadoSegunTarea(tarea),
        tarea,
        contactos,
        nota: tarea.nota,
        interlocutor: tarea.interlocutor,
    };
};

export const cambiarProceso: ProcesarVisita = async (ctx, payload) => ({ ...ctx, ...(payload as CambioVisita), errores: [] });

export const iniciarProceso: ProcesarVisita = async (ctx) => {
    const tarea = ctx.tarea!;
    await iniciarVisita(tarea.id, await posicionActual());
    return { ...ctx, estado: "EN_CURSO", tarea: await getTareaVisita(tarea.id) };
};

export const pedirFinalizacionProceso: ProcesarVisita = async (ctx) => ({
    ...ctx,
    estado: "FINALIZANDO",
    horaFin: horaActual(),
    errores: [],
});

export const volverProceso: ProcesarVisita = async (ctx) => ({
    ...ctx,
    estado: ctx.tarea?.enCurso ? "EN_CURSO" : "PENDIENTE",
    errores: [],
});

export const guardarProceso: ProcesarVisita = async (ctx) => {
    const errores = erroresFinalizacion(ctx);
    if (errores.length > 0) return { ...ctx, errores };

    const tarea = ctx.tarea!;
    await finalizarTarea(tarea.id, finalizacionParaAPI(ctx, await posicionActual()));

    if (!tarea.idTrato || (await quedanTareasPendientes(tarea.idTrato, tarea.id))) {
        return { ...ctx, estado: "TERMINADA" };
    }
    return { ...ctx, estado: "CERRANDO_TRATO", causas: await getCausasPerdida(tarea.idTrato) };
};

export const cerrarTratoProceso: ProcesarVisita = async (ctx) => {
    const errores = erroresCierreTrato(ctx);
    if (errores.length > 0) return { ...ctx, errores };

    await cerrarTrato(ctx.tarea!.idTrato!, ctx.estadoTrato!, ctx.idCausa);
    return { ...ctx, estado: "TERMINADA", tratoCerrado: true };
};
