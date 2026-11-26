import { tCompras } from "#/compras/i18n/index.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "../comun/urls.ts";
import { ActualizarArticulosProveedor, ConfigCompras, GetConfigCompras, PatchConfigCompras } from "./diseño.ts";
import { configComprasPorDefecto } from "./dominio.ts";

export interface ConfigComprasApi {
    actualizar_articulos_proveedor: ActualizarArticulosProveedor;
}

const baseUrl = new ApiUrls().CONFIG;

export const configComprasDesdeApi = (api: ConfigComprasApi): ConfigCompras => ({
    actualizarArticulosProveedor: api.actualizar_articulos_proveedor,
});

export const configComprasAApi = (config: ConfigCompras): ConfigComprasApi => ({
    actualizar_articulos_proveedor: config.actualizarArticulosProveedor,
});

/** Sin fila en `facturac_general` (404) la instalación aún no se ha configurado. */
export const getConfigCompras: GetConfigCompras = async () => {
    try {
        const respuesta = await RestAPI.get<{ datos: ConfigComprasApi }>(baseUrl);
        return configComprasDesdeApi(respuesta.datos);
    } catch (error) {
        if ((error as { estado?: number }).estado === 404) return configComprasPorDefecto;
        throw error;
    }
};

export const patchConfigCompras: PatchConfigCompras = async (config) => {
    await RestAPI.patch(
        baseUrl, { cambios: configComprasAApi(config) }, tCompras("config.errores.guardar"));
};
