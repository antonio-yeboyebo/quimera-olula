import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "../comun/urls.ts";
import { ConfigAlmacen, GetConfigAlmacen, PatchConfigAlmacen } from "./diseño.ts";
import { configAlmacenPorDefecto } from "./dominio.ts";
import { tAlmacen } from "../i18n/index.ts";

export interface ConfigAlmacenApi {
    impuesto_id: string | null;
    usar_iva_defecto: boolean;
}

const baseUrl = new ApiUrls().CONFIG;

export const configAlmacenDesdeApi = (api: ConfigAlmacenApi): ConfigAlmacen => ({
    impuestoId: api.impuesto_id ?? "",
    usarIvaDefecto: api.usar_iva_defecto,
});

export const configAlmacenAApi = (config: ConfigAlmacen): ConfigAlmacenApi => ({
    impuesto_id: config.impuestoId || null,
    usar_iva_defecto: config.usarIvaDefecto,
});

/** Sin fila en `factalma_general` (404) la instalación aún no se ha configurado. */
export const getConfigAlmacen: GetConfigAlmacen = async () => {
    try {
        const respuesta = await RestAPI.get<{ datos: ConfigAlmacenApi }>(baseUrl);
        return configAlmacenDesdeApi(respuesta.datos);
    } catch (error) {
        if ((error as { estado?: number }).estado === 404) return configAlmacenPorDefecto;
        throw error;
    }
};

export const patchConfigAlmacen: PatchConfigAlmacen = async (config) => {
    await RestAPI.patch(
        baseUrl, { cambios: configAlmacenAApi(config) }, tAlmacen("config.errorAlGuardarLaConfiguracionDe"));
};
