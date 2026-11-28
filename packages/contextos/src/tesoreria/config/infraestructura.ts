import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "../comun/urls.js";
import { ConfigTesoreria, GetConfigTesoreria, PatchConfigTesoreria } from "./diseño.ts";
import { configTesoreriaPorDefecto, conRemesasPago, flagsDesdeModo, modoDesdeFlags } from "./dominio.ts";
import { tTesoreria } from "../i18n/index.ts";

interface ConfigTesoreriaApi {
    pago_diferido: boolean;
    pago_indirecto: boolean;
    pago_diferido_prov?: boolean;
    pago_indirecto_prov?: boolean;
}

const baseUrl = new ApiUrls().CONFIG;

export const configTesoreriaDesdeApi = (api: ConfigTesoreriaApi): ConfigTesoreria => ({
    modoCobro: modoDesdeFlags(api.pago_diferido, api.pago_indirecto),
    modoPago: modoDesdeFlags(!!api.pago_diferido_prov, !!api.pago_indirecto_prov),
});

/** Los campos de remesas de pago solo van con su plugin activo. */
export const configTesoreriaAApi = (
    config: ConfigTesoreria,
    remesasPago: boolean = conRemesasPago(),
): ConfigTesoreriaApi => {
    const cobro = flagsDesdeModo(config.modoCobro);
    const pago = flagsDesdeModo(config.modoPago);
    return {
        pago_diferido: cobro.diferido,
        pago_indirecto: cobro.indirecto,
        ...(remesasPago && {
            pago_diferido_prov: pago.diferido,
            pago_indirecto_prov: pago.indirecto,
        }),
    };
};

/** Sin fila en `factteso_general` (404) la instalación aún no se ha configurado. */
export const getConfigTesoreria: GetConfigTesoreria = async () => {
    try {
        const respuesta = await RestAPI.get<{ datos: ConfigTesoreriaApi }>(baseUrl);
        return configTesoreriaDesdeApi(respuesta.datos);
    } catch (error) {
        if ((error as { estado?: number }).estado === 404) return configTesoreriaPorDefecto;
        throw error;
    }
};

/**
 * `configuracion("tesoreria.pago_diferido")` lee la config del whoami guardado al
 * entrar: se actualiza para que las remesas apliquen el modo nuevo sin volver a entrar.
 */
const actualizarConfigEnSesion = (api: ConfigTesoreriaApi): void => {
    const raw = localStorage.getItem("whoami");
    if (!raw) return;
    try {
        const whoAmI = JSON.parse(raw);
        whoAmI.config = { ...whoAmI.config, tesoreria: { ...whoAmI.config?.tesoreria, ...api } };
        localStorage.setItem("whoami", JSON.stringify(whoAmI));
    } catch {
        // Un whoami ilegible se rehace en el siguiente login.
    }
};

export const patchConfigTesoreria: PatchConfigTesoreria = async (config) => {
    const cambios = configTesoreriaAApi(config);
    await RestAPI.patch(baseUrl, { cambios }, tTesoreria("config.errorAlGuardarLaConfiguracionDe"));
    actualizarConfigEnSesion(cambios);
};
