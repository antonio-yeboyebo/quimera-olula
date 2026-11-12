import { LegacyAPI, legacyUrl } from "@olula/lib/api/legacy_api.ts";
import { Posicion } from "../comun/geolocalizacion.ts";
import { ClienteMapaAPI, FiltrosProspeccion, ResultadoMapa } from "./diseño.ts";
import { clienteMapaDesdeAPI, parametrosBusqueda } from "./dominio.ts";

const CLAVE_ULTIMA_CAPITAL = "smartsales.prospeccion.capital";

export const buscarClientesMapa = async (centro: Posicion, filtros: FiltrosProspeccion, soloTotal = false): Promise<ResultadoMapa> => {
    const respuesta = await LegacyAPI.get<{ total: number; clientes: ClienteMapaAPI[] }>(
        legacyUrl("ss_recomendaciones", {
            action: "get_clientes_mapa",
            staticAction: true,
            params: { extra: parametrosBusqueda(centro, filtros, soloTotal) },
        })
    );
    return { total: Number(respuesta.total) || 0, clientes: respuesta.clientes.map(clienteMapaDesdeAPI) };
};

export const leerUltimaCapital = (): string | null => {
    try {
        return localStorage.getItem(CLAVE_ULTIMA_CAPITAL);
    } catch {
        return null;
    }
};

export const guardarUltimaCapital = (capital: string) => {
    try {
        localStorage.setItem(CLAVE_ULTIMA_CAPITAL, capital);
    } catch {
        return;
    }
};
