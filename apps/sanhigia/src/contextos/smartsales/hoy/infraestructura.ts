import { LegacyAPI, legacyUrl } from "@olula/lib/api/legacy_api.ts";
import { Trimestre } from "../comun/diseño.ts";
import {
    Avisos,
    BloqueKpi,
    BloqueKpiAPI,
    ProgresoComercial,
    ProgresoComercialAPI,
    TratoAbierto,
    TratoAbiertoAPI,
} from "./diseño.ts";

export const bloqueKpiDesdeAPI = (bloque: BloqueKpiAPI | undefined): BloqueKpi => ({
    lineas: (bloque?.detalle ?? []).map((linea, indice) => ({
        clave: String(linea.id ?? `${linea.codfamilia ?? ""}-${linea.codsubfamilia ?? ""}-${indice}`),
        etiqueta: (linea.etiqueta ?? linea.nombre ?? "").replace(/\s*\(\d+ \/ \d+\)$/, ""),
        objetivo: Number(linea.objetivo) || 0,
        alcanzada: Number(linea.alcanzada) || 0,
    })),
    rango: bloque?.fechainicio && bloque?.fechafin ? { desde: bloque.fechainicio, hasta: bloque.fechafin } : null,
});

export const getProgresoComercial = async (agente: string | null, trimestre: Trimestre): Promise<ProgresoComercial> => {
    const trimestres = Object.fromEntries([1, 2, 3, 4].map((n) => [`T${n}`, n === trimestre.numero]));
    const progreso = await LegacyAPI.get<ProgresoComercialAPI>(
        legacyUrl("usuarios", {
            action: "dame_kpi_progreso",
            staticAction: true,
            params: { extra: { codAgente: agente ?? "TODOS", customDates: false, ...trimestres } },
        })
    );

    return {
        ventas: progreso.total,
        objetivo: progreso.goal,
        porcentaje: progreso.percent,
        incremento: progreso.increment,
        nuevosClientes: bloqueKpiDesdeAPI(progreso.kpi_nuevos_clientes_familia),
        unidades: bloqueKpiDesdeAPI(progreso.kpi_unidades_producto),
    };
};

export const getAvisos = async (): Promise<Avisos> => {
    const accion = (action: string) => legacyUrl("sh_timelinecontacto", { action, staticAction: true });
    const [interacciones, pedidos] = await Promise.all([
        LegacyAPI.get<{ totalinteraccioneseventos: number; totalinteraccionesactivos: number }>(
            accion("get_counter_interacciones")
        ),
        LegacyAPI.get<{ totalpedidos: number }>(accion("get_count_pedidos_otro_agente")),
    ]);

    return {
        contactosCursos: Number(interacciones.totalinteraccioneseventos) || 0,
        contactosActivos: Number(interacciones.totalinteraccionesactivos) || 0,
        pedidosOtrosAgentes: Number(pedidos.totalpedidos) || 0,
    };
};

export const getTratosAbiertos = async (agente: string | null, limite = 5): Promise<TratoAbierto[]> => {
    const filtroAgente = agente
        ? [{ or: [["codagente", "eq", agente], ["codagenteobservador", "eq", agente]] }]
        : [];
    const respuesta = await LegacyAPI.get<{ data: TratoAbiertoAPI[] }>(
        legacyUrl("ss_tratos", {
            params: {
                filter: { and: [["estado", "eq", "-"], ...filtroAgente] },
                fields: ["idtrato", "titulo", "nombrecliente", "nombrecontacto", "valor", "fecha"],
                order: { field: "fecha", direction: "DESC" },
                page: { limit: limite },
            },
        })
    );

    return respuesta.data.map((trato) => ({
        id: String(trato.idtrato),
        titulo: trato.titulo,
        cliente: trato.nombrecliente ?? trato.nombrecontacto,
        valor: Number(trato.valor) || 0,
        fecha: trato.fecha,
    }));
};
