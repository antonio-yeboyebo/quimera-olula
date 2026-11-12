import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "@olula/lib/api/urls.ts";
import { RespuestaLista2 } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { GetProvincias } from "./diseño.ts";

type ProvinciaApi = { id: number; nombre: string };

export const getProvincias: GetProvincias = async (filtro, orden, paginacion) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<RespuestaLista2<ProvinciaApi>>(ApiUrls.COMUN_PROVINCIA + q);

    return {
        datos: respuesta.datos.map((p) => ({ id: String(p.id), nombre: p.nombre })),
        total: respuesta.total,
    };
};
