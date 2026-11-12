import { LegacyAPI, legacyUrl } from "@olula/lib/api/legacy_api.ts";
import { Trimestre } from "../comun/diseño.ts";
import { bloqueKpiDesdeAPI } from "../hoy/infraestructura.ts";
import {
    ClienteRecomendadoAPI,
    LineaClientesNuevos,
    LineaClientesNuevosAPI,
    ObjetivosAPI,
    ObjetivosNuevosClientes,
    PaginaRecomendados,
} from "./diseño.ts";
import { clienteRecomendadoDesdeAPI, lineaClientesNuevosDesdeAPI, productosDelObjetivo, textoKpiTrimestres } from "./dominio.ts";

const parametros = (agente: string | null, trimestres: Trimestre[]) => ({
    codAgente: agente ?? "TODOS",
    customDates: false,
    kpiTrimestres: textoKpiTrimestres(trimestres),
});

export const getObjetivos = async (agente: string | null, trimestres: Trimestre[]): Promise<ObjetivosNuevosClientes> => {
    const respuesta = await LegacyAPI.get<ObjetivosAPI>(
        legacyUrl("usuarios", { action: "dame_kpi_progreso", staticAction: true, params: { extra: parametros(agente, trimestres) } })
    );
    return {
        nuevosClientes: bloqueKpiDesdeAPI(respuesta.kpi_nuevos_clientes_familia),
        unidades: bloqueKpiDesdeAPI(respuesta.kpi_unidades_producto),
        ...productosDelObjetivo(respuesta.kpi_nuevos_clientes_familia),
    };
};

export const getClientesNuevos = async (agente: string | null, trimestres: Trimestre[]): Promise<LineaClientesNuevos[]> => {
    const respuesta = await LegacyAPI.get<{ lineas: LineaClientesNuevosAPI[] }>(
        legacyUrl("usuarios", { action: "dame_clientes_nuevos_kpi", staticAction: true, params: { extra: parametros(agente, trimestres) } })
    );
    return respuesta.lineas.map(lineaClientesNuevosDesdeAPI);
};

const getSubfamiliasDeFamilias = async (familias: string[]): Promise<string[]> => {
    if (familias.length === 0) return [];
    const respuesta = await LegacyAPI.get<{ data: { codsubfamilia: string }[] }>(
        legacyUrl("subfamilias", {
            params: { filter: { and: [["codfamilia", "in", familias]] }, fields: ["codsubfamilia"], page: { limit: 1000 } },
        })
    );
    return respuesta.data.map((s) => s.codsubfamilia);
};

export const getClientesRecomendados = async (
    familias: string[],
    subfamilias: string[],
    siguiente: [number, number] | null = null
): Promise<PaginaRecomendados> => {
    const todas = [...new Set([...subfamilias, ...(await getSubfamiliasDeFamilias(familias))])];
    if (todas.length === 0) return { clientes: [], siguiente: null };
    const respuesta = await LegacyAPI.get<{ data: ClienteRecomendadoAPI[]; page: { next: [number, number] | null } }>(
        legacyUrl("ss_recomendaciones", {
            action: "get_clientes_by_subfamilia",
            staticAction: true,
            params: { filter: { and: [["codsubfamilia", "in", todas]] }, page: { limit: 20, next: siguiente } },
        })
    );
    return { clientes: respuesta.data.map(clienteRecomendadoDesdeAPI), siguiente: respuesta.page.next };
};
