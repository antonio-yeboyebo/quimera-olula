import { ClausulaFiltro, Filtro, Orden, Paginacion } from "@olula/lib/diseño.ts";
import {
    construirUrlConFiltro,
    EstadoCargaWidget,
    fechaLocalStr
} from "../../widgets/comun.ts";
import { Accion } from "../diseño.ts";
import { getAcciones } from "../infraestructura.ts";
import { tCrm } from "../../i18n/index.ts";

export type GrupoAccionesHoy = {
    tipo: string;
    acciones: Accion[];
};

export type FiltroAccionesWidget = "pendientes" | "retrasadas" | "hoy";

export type ModeloWidgetAccionesHoy = {
    estado: EstadoCargaWidget;
    totalAcciones: number;
    totalRetrasadas: number;
    totalPendientes: number;
    gruposHoy: GrupoAccionesHoy[];
    gruposRetrasadas: GrupoAccionesHoy[];
    gruposPendientes: GrupoAccionesHoy[];
    urlVer: string;
    urlVerHoy: string;
    urlVerRetrasadas: string;
    urlVerPendientes: string;
};

const RUTA_ACCIONES = "/crm/accion";
const ORDEN_ACCIONES: Orden = ["fecha", "ASC", "id", "DESC"] as unknown as Orden;
const PAGINACION_ACCIONES: Paginacion = { pagina: 1, limite: 200 };

export const modeloWidgetAccionesHoyInicial: ModeloWidgetAccionesHoy = {
    estado: "cargando",
    totalAcciones: 0,
    totalRetrasadas: 0,
    totalPendientes: 0,
    gruposHoy: [],
    gruposRetrasadas: [],
    gruposPendientes: [],
    urlVer: RUTA_ACCIONES,
    urlVerHoy: RUTA_ACCIONES,
    urlVerRetrasadas: RUTA_ACCIONES,
    urlVerPendientes: RUTA_ACCIONES,
};

const agruparPorTipo = (acciones: Accion[]): GrupoAccionesHoy[] => {
    const grupos = new Map<string, Accion[]>();

    for (const accion of acciones) {
        const tipo = accion.tipo || tCrm("accion.sinTipo");
        const lista = grupos.get(tipo) ?? [];
        lista.push(accion);
        grupos.set(tipo, lista);
    }

    return Array.from(grupos.entries())
        .sort(([tipoA], [tipoB]) => tipoA.localeCompare(tipoB))
        .map(([tipo, accionesGrupo]) => ({ tipo, acciones: accionesGrupo }));
};

export const cargarModeloWidgetAccionesHoy = async (): Promise<ModeloWidgetAccionesHoy> => {
    const hoy = fechaLocalStr(new Date());
    const filtroHoy: ClausulaFiltro[] = [
        ["fecha", "<>", `${hoy}_${hoy}`] as ClausulaFiltro,
        ["estado", "in", ["Pendiente", "Borrador"] as unknown as string] as ClausulaFiltro,
    ];

    const filtroRetrasadas: ClausulaFiltro[] = [
        ["fecha", "<", hoy] as ClausulaFiltro,
        ["estado", "in", ["Pendiente", "Borrador"] as unknown as string] as ClausulaFiltro,
    ];

    const filtroPendientes: ClausulaFiltro[] = [
        ["estado", "in", ["Pendiente", "Borrador"] as unknown as string] as ClausulaFiltro,
    ];

    const [resultadoHoy, resultadoRetrasadas, resultadoPendientes] = await Promise.all([
        getAcciones(filtroHoy as unknown as Filtro, ORDEN_ACCIONES, PAGINACION_ACCIONES),
        getAcciones(filtroRetrasadas as unknown as Filtro, ORDEN_ACCIONES, PAGINACION_ACCIONES),
        getAcciones(filtroPendientes as unknown as Filtro, ORDEN_ACCIONES, PAGINACION_ACCIONES),
    ]);

    const urlVerHoy = construirUrlConFiltro(RUTA_ACCIONES, filtroHoy, {
        orden: ORDEN_ACCIONES,
    });
    const urlVerRetrasadas = construirUrlConFiltro(RUTA_ACCIONES, filtroRetrasadas, {
        orden: ORDEN_ACCIONES,
    });
    const urlVerPendientes = construirUrlConFiltro(RUTA_ACCIONES, filtroPendientes, {
        orden: ORDEN_ACCIONES,
    });

    return {
        estado: "listo",
        totalAcciones: resultadoHoy.total,
        totalRetrasadas: resultadoRetrasadas.total,
        totalPendientes: resultadoPendientes.total,
        gruposHoy: agruparPorTipo(resultadoHoy.datos),
        gruposRetrasadas: agruparPorTipo(resultadoRetrasadas.datos),
        gruposPendientes: agruparPorTipo(resultadoPendientes.datos),
        urlVer: urlVerHoy,
        urlVerHoy,
        urlVerRetrasadas,
        urlVerPendientes,
    };
};