import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { fechaIso } from "../comun/dominio.ts";
import {
    CampaniaAPI,
    CampaniaLista,
    CampaniaListaAPI,
    ClienteCampania,
    ClientePrevio,
    ClientePrevioAPI,
    ContextoNuevaCampania,
    EstadoNuevaCampania,
    FormularioCampania,
    ResumenCampania,
    ResumenCampaniaAPI,
    TipoCampania,
} from "./diseño.ts";
import { crearCampania, previsualizarCampania } from "./infraestructura.ts";

type ProcesarNuevaCampania = ProcesarContexto<EstadoNuevaCampania, ContextoNuevaCampania>;

export const textoTipoCampania: Record<TipoCampania, string> = {
    inactivos: "Clientes inactivos",
    ventaCruzada: "Venta cruzada",
    captacion: "Afinidad a un producto",
};

export const formularioInicial = (hoy: Date = new Date()): FormularioCampania => {
    const haceUnAño = new Date(hoy);
    haceUnAño.setFullYear(hoy.getFullYear() - 1);
    return {
        tipo: "inactivos",
        tipoProducto: "subfamilia",
        subfamilia: null,
        articulos: [],
        modoIncluidos: "alguno",
        excluidos: [],
        modoExcluidos: "ninguno",
        dias: 90,
        desde: fechaIso(haceUnAño),
        hasta: fechaIso(hoy),
        umbral: 0.7,
        nombre: "",
        descripcion: "",
    };
};

export const contextoInicial: ContextoNuevaCampania = {
    estado: "DEFINIENDO",
    formulario: formularioInicial(),
    agente: null,
    clientes: [],
    idCampania: null,
    errores: [],
};

export const tipoProductoDe = (formulario: FormularioCampania) => {
    if (formulario.tipo === "ventaCruzada") return "listadearticulos";
    if (formulario.tipo === "captacion") return "subfamilia";
    return formulario.tipoProducto;
};

export const erroresCampania = (formulario: FormularioCampania): string[] => {
    const tipoProducto = tipoProductoDe(formulario);
    const sinProducto = tipoProducto === "subfamilia" ? !formulario.subfamilia : formulario.articulos.length === 0;
    return [
        !formulario.nombre.trim() && "Indica el nombre de la campaña",
        sinProducto && (tipoProducto === "subfamilia" ? "Elige la subfamilia" : "Añade al menos un artículo"),
        formulario.tipo === "inactivos" && !(formulario.dias > 0) && "Indica los días sin compra",
        formulario.tipo === "ventaCruzada" && (!formulario.desde || !formulario.hasta || formulario.desde > formulario.hasta) && "Indica un periodo de compra válido",
        formulario.tipo === "captacion" && !(formulario.umbral > 0 && formulario.umbral <= 1) && "El umbral de afinidad va de 0 a 100 %",
    ].filter((e): e is string => !!e);
};

const listaProductos = (formulario: FormularioCampania) => {
    const lista_incluidos = { refs: formulario.articulos.map((a) => a.codigo).join(";"), tipo: formulario.tipo === "ventaCruzada" ? formulario.modoIncluidos : "alguno" };
    if (formulario.tipo !== "ventaCruzada" || formulario.excluidos.length === 0) return { lista_incluidos };
    return { lista_incluidos, lista_excluidos: { refs: formulario.excluidos.map((a) => a.codigo).join(";"), tipo: formulario.modoExcluidos } };
};

export const campaniaParaAPI = (formulario: FormularioCampania, agente: string | null): CampaniaAPI => {
    const tipoProducto = tipoProductoDe(formulario);
    return {
        tipo: formulario.tipo,
        tipoproducto: tipoProducto,
        subfamilia: tipoProducto === "subfamilia" ? (formulario.subfamilia?.codigo ?? null) : null,
        productos: tipoProducto === "listadearticulos" ? JSON.stringify(listaProductos(formulario)) : null,
        diasdesdeultimacompra: formulario.tipo === "inactivos" ? formulario.dias : null,
        fechainicioultimacompra: formulario.tipo === "ventaCruzada" ? formulario.desde : null,
        fechafinultimacompra: formulario.tipo === "ventaCruzada" ? formulario.hasta : null,
        umbralrecomendacion: formulario.tipo === "captacion" ? formulario.umbral : null,
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim() || null,
        codagente: agente,
    };
};

export const clientePrevioDesdeAPI = (cliente: ClientePrevioAPI): ClientePrevio => ({
    codCliente: cliente.codcliente,
    nombre: cliente.nombre,
    ciudad: cliente.ciudad,
    afinidad: cliente.afinidad === null ? null : Number(cliente.afinidad),
});

export const campaniaListaDesdeAPI = (campania: CampaniaListaAPI): CampaniaLista => ({
    id: String(campania.idcampania),
    nombre: campania.nombre,
    descripcion: campania.descripcion,
    tipo: campania.tipo,
    fechaAlta: campania.fechaalta,
    totales: Number(campania.totales) || 0,
    ganados: Number(campania.ganados) || 0,
    perdidos: Number(campania.perdidos) || 0,
});

export const resumenDesdeAPI = (resumen: ResumenCampaniaAPI): ResumenCampania => ({
    id: String(resumen.idcampania),
    nombre: resumen.nombre,
    descripcion: resumen.descripcion,
    tipo: resumen.tipo,
    fechaAlta: resumen.fechaalta,
    clientes: resumen.clientes.map((c) => ({
        codCliente: c.codcliente,
        nombre: c.nombre,
        ciudad: c.ciudad,
        latitud: c.latitud,
        longitud: c.longitud,
        idTrato: String(c.idtrato),
        estado: c.estado || "-",
        afinidad: c.afinidad === null ? null : Number(c.afinidad),
        ventas12Meses: Number(c.ventas12meses) || 0,
        ultimaCompra: c.ultimacompra,
        ventasCampania: Number(c.ventascampania) || 0,
    })),
});

export const trabajado = (cliente: ClienteCampania) => cliente.estado === "Ganado" || cliente.estado === "Perdido";

export const totalesCampania = (clientes: ClienteCampania[]) => ({
    total: clientes.length,
    trabajados: clientes.filter(trabajado).length,
    ganados: clientes.filter((c) => c.estado === "Ganado").length,
});

export const recomendados = (clientes: ClienteCampania[]) =>
    clientes.filter((c) => !trabajado(c)).sort((a, b) => (b.afinidad ?? -1) - (a.afinidad ?? -1) || a.nombre.localeCompare(b.nombre));

export const trabajados = (clientes: ClienteCampania[]) => clientes.filter(trabajado);

export const conVentas = (clientes: ClienteCampania[]) =>
    clientes.filter((c) => c.ventasCampania > 0).sort((a, b) => b.ventasCampania - a.ventasCampania);

export const cambiarProceso: ProcesarNuevaCampania = async (ctx, payload) => ({
    ...ctx,
    formulario: { ...ctx.formulario, ...(payload as Partial<FormularioCampania>) },
    errores: [],
});

export const fijarAgenteProceso: ProcesarNuevaCampania = async (ctx, payload) => ({ ...ctx, agente: (payload as string | null) ?? null });

export const previsualizarProceso: ProcesarNuevaCampania = async (ctx) => {
    const errores = erroresCampania(ctx.formulario);
    if (errores.length > 0) return { ...ctx, errores };
    const clientes = await previsualizarCampania(campaniaParaAPI(ctx.formulario, ctx.agente));
    return { ...ctx, estado: "REVISANDO", clientes, errores: [] };
};

export const volverProceso: ProcesarNuevaCampania = async (ctx) => ({ ...ctx, estado: "DEFINIENDO", errores: [] });

export const crearProceso: ProcesarNuevaCampania = async (ctx) => {
    if (ctx.clientes.length === 0) return { ...ctx, errores: ["La campaña no tiene clientes"] };
    const idCampania = await crearCampania(campaniaParaAPI(ctx.formulario, ctx.agente));
    return { ...ctx, estado: "CREADA", idCampania };
};
