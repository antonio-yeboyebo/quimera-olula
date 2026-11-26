import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "../comun/urls.ts";
import { ConfigVentas, GetConfigVentas, PatchConfigVentas, SiNoPreguntar } from "./diseño.ts";
import { configVentasPorDefecto } from "./dominio.ts";
import { tVentas } from "../i18n/index.ts";

export interface ConfigVentasApi {
    mostrar_observaciones_cliente: boolean;
    facturar_albaranes_borrador: SiNoPreguntar;
    crear_facturas_borrador: SiNoPreguntar;
    correo_copias: string | null;
    no_disponibles?: string[];
}

const baseUrl = new ApiUrls().CONFIG;

export const configVentasDesdeApi = (api: ConfigVentasApi): ConfigVentas => ({
    mostrarObservacionesCliente: api.mostrar_observaciones_cliente,
    facturarAlbaranesBorrador: api.facturar_albaranes_borrador,
    crearFacturasBorrador: api.crear_facturas_borrador,
    correoCopias: api.correo_copias ?? "",
    noDisponibles: api.no_disponibles ?? [],
});

export const configVentasAApi = (config: ConfigVentas): ConfigVentasApi => ({
    mostrar_observaciones_cliente: config.mostrarObservacionesCliente,
    facturar_albaranes_borrador: config.facturarAlbaranesBorrador,
    crear_facturas_borrador: config.crearFacturasBorrador,
    correo_copias: config.correoCopias.trim() || null,
});

/** Sin fila en `facturac_general` (404) la instalación aún no se ha configurado. */
export const getConfigVentas: GetConfigVentas = async () => {
    try {
        const respuesta = await RestAPI.get<{ datos: ConfigVentasApi }>(baseUrl);
        return configVentasDesdeApi(respuesta.datos);
    } catch (error) {
        if ((error as { estado?: number }).estado === 404) return configVentasPorDefecto;
        throw error;
    }
};

export const patchConfigVentas: PatchConfigVentas = async (config) => {
    await RestAPI.patch(
        baseUrl, { cambios: configVentasAApi(config) }, tVentas("config.errores.guardar"));
};
