import { LegacyAPI, legacyUrl } from "@olula/lib/api/legacy_api.ts";
import { Periodo } from "../comun/diseño.ts";
import { HistoricoAPI, MesHistorico, VentasFamilia, VentasFamiliaAPI, VentasPeriodo, VentasPeriodoAPI } from "./diseño.ts";
import { familiaDesdeAPI, historicoDesdeAPI, parametrosPeriodo } from "./dominio.ts";

export const getVentasPeriodo = async (agente: string | null, periodo: Periodo): Promise<VentasPeriodo> => {
    const progreso = await LegacyAPI.get<VentasPeriodoAPI>(
        legacyUrl("usuarios", {
            action: "dame_kpi_progreso",
            staticAction: true,
            params: { extra: parametrosPeriodo(periodo, agente) },
        })
    );
    return {
        ventas: Number(progreso.total) || 0,
        objetivo: Number(progreso.goal) || 0,
        ventasAñoAnterior: Number(progreso.previous_year_sold) || 0,
    };
};

export const getHistoricoVentas = async (agente: string | null, año: number): Promise<MesHistorico[]> => {
    const historico = await LegacyAPI.get<HistoricoAPI>(
        legacyUrl("ss_graficos", {
            action: "get_historico_prevision",
            staticAction: true,
            params: { extra: { importes: true, codAgente: agente ?? "TODOS", anio: año } },
        })
    );
    return historicoDesdeAPI(historico);
};

export const getVentasFamilia = async (agente: string | null, periodo: Periodo): Promise<VentasFamilia[]> => {
    const respuesta = await LegacyAPI.get<{ familias: VentasFamiliaAPI[] }>(
        legacyUrl("usuarios", {
            action: "dame_ventas_familia",
            staticAction: true,
            params: { extra: parametrosPeriodo(periodo, agente) },
        })
    );
    return respuesta.familias.map(familiaDesdeAPI);
};
