import { LegacyAPI, legacyUrl } from "@olula/lib/api/legacy_api.ts";
import { CampaniaAPI, CampaniaLista, CampaniaListaAPI, ClientePrevio, ClientePrevioAPI, ResumenCampania, ResumenCampaniaAPI } from "./diseño.ts";
import { campaniaListaDesdeAPI, clientePrevioDesdeAPI, resumenDesdeAPI } from "./dominio.ts";

const accion = (action: string) => legacyUrl("ss_campanias", { action, staticAction: true });

export const previsualizarCampania = async (campania: CampaniaAPI): Promise<ClientePrevio[]> => {
    const respuesta = await LegacyAPI.post<CampaniaAPI, { clientes: ClientePrevioAPI[] }>(accion("previsualizar_campania_comercial"), campania);
    return respuesta.clientes.map(clientePrevioDesdeAPI);
};

export const crearCampania = async (campania: CampaniaAPI): Promise<string> => {
    const respuesta = await LegacyAPI.post<CampaniaAPI, { pk: number }>(accion("crear_campania_comercial"), campania);
    return String(respuesta.pk);
};

export const getCampanias = async (agente: string | null): Promise<CampaniaLista[]> => {
    const respuesta = await LegacyAPI.get<{ campanias: CampaniaListaAPI[] }>(
        legacyUrl("ss_campanias", { action: "dame_campanias_comercial", staticAction: true, params: { extra: { codagente: agente } } })
    );
    return respuesta.campanias.map(campaniaListaDesdeAPI);
};

export const getResumenCampania = async (id: string): Promise<ResumenCampania> => {
    const respuesta = await LegacyAPI.get<ResumenCampaniaAPI>(legacyUrl("ss_campanias", { id, action: "dame_resumen_campania_comercial" }));
    return resumenDesdeAPI(respuesta);
};
