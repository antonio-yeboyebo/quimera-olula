import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "@olula/lib/api/urls.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { GetProvincias, Provincia } from "./diseño.ts";

type ProvinciaAPI = {
    id: number;
    nombre: string;
    pais_id: string;
};

const provinciaDesdeAPI = (p: ProvinciaAPI): Provincia => ({
    id: String(p.id),
    nombre: p.nombre,
    paisId: p.pais_id,
});

export const getProvincias: GetProvincias = async (filtro, orden) => {

    const q = criteriaQuery(filtro, orden);
    const respuesta = await RestAPI.get<{ datos: ProvinciaAPI[] }>(ApiUrls.COMUN_PROVINCIA + q);

    return respuesta.datos.map(provinciaDesdeAPI);
};
