import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "../comun/urls.ts";
import { GetMiCuenta, Idioma, MiCuenta, PatchMiCuenta } from "./diseño.ts";
import { idiomaDesde } from "./dominio.ts";

export interface MiCuentaApi {
    id: string;
    nombre: string;
    email: string | null;
    idioma: string | null;
}

/** Lo único que se manda al guardar: el servidor no cambia nombre ni email por aquí. */
export interface CambiosMiCuentaApi {
    idioma: Idioma;
}

const baseUrl = new ApiUrls().MI_CUENTA;

export const miCuentaDesdeApi = (api: MiCuentaApi): MiCuenta => ({
    id: api.id,
    nombre: api.nombre,
    email: api.email,
    idioma: idiomaDesde(api.idioma),
});

export const miCuentaAApi = (miCuenta: MiCuenta): CambiosMiCuentaApi => ({
    idioma: miCuenta.idioma,
});

export const getMiCuenta: GetMiCuenta = async () => {
    const respuesta = await RestAPI.get<{ datos: MiCuentaApi }>(baseUrl);
    return miCuentaDesdeApi(respuesta.datos);
};

export const patchMiCuenta: PatchMiCuenta = async (miCuenta) => {
    await RestAPI.patch(baseUrl, miCuentaAApi(miCuenta), "Error al guardar tu cuenta");
};
