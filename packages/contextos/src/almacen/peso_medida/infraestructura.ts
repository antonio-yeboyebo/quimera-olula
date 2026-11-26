import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import {
    CambiosPesoMedida,
    DeletePesoMedida,
    GetPesoMedida,
    GetPesosMedidas,
    Magnitud,
    NuevoPesoMedida,
    PatchPesoMedida,
    PesoMedida,
    PostPesoMedida,
} from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

const baseUrl = `/almacen/peso_medida`;

interface PesoMedidaApi {
    id: string;
    descripcion: string;
    magnitud: string | null;
    factor_conversion: number | null;
}

type CambiosPesoMedidaApi = Partial<Omit<PesoMedidaApi, "id">>;

export const pesoMedidaDesdeApi = (api: PesoMedidaApi): PesoMedida => ({
    id: api.id,
    descripcion: api.descripcion ?? "",
    magnitud: (api.magnitud ?? "") as Magnitud | "",
    factorConversion: Number(api.factor_conversion ?? 0),
});

const nuevoPesoMedidaAApi = (n: NuevoPesoMedida): PesoMedidaApi => ({
    id: n.id.trim(),
    descripcion: n.descripcion,
    magnitud: n.magnitud || null,
    factor_conversion: Number(n.factorConversion) || 0,
});

export const cambiosPesoMedidaAApi = (c: CambiosPesoMedida): CambiosPesoMedidaApi => {
    const cambios: CambiosPesoMedidaApi = {};
    if (c.descripcion !== undefined) cambios.descripcion = String(c.descripcion);
    if (c.magnitud !== undefined) cambios.magnitud = c.magnitud ? String(c.magnitud) : null;
    if (c.factorConversion !== undefined) cambios.factor_conversion = Number(c.factorConversion) || 0;
    return cambios;
};

export const getPesoMedida: GetPesoMedida = async (id) =>
    RestAPI.getItem<PesoMedida, PesoMedidaApi>(`${baseUrl}/${id}`, pesoMedidaDesdeApi);

export const getPesosMedidas: GetPesosMedidas = async (criteria: Criteria) =>
    RestAPI.getQuery<PesoMedida, PesoMedidaApi>(baseUrl, criteria, pesoMedidaDesdeApi);

export const postPesoMedida: PostPesoMedida = async (nuevo) => {
    const respuesta = await RestAPI.post<PesoMedidaApi>(baseUrl, nuevoPesoMedidaAApi(nuevo), tAlmacen("peso_medida.errorAlCrearLaUnidad"));
    return respuesta.id;
};

export const patchPesoMedida: PatchPesoMedida = async (id, cambios) => {
    await RestAPI.patch<CambiosPesoMedidaApi>(`${baseUrl}/${id}`, cambiosPesoMedidaAApi(cambios), tAlmacen("peso_medida.errorAlActualizarLaUnidad"));
};

export const deletePesoMedida: DeletePesoMedida = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tAlmacen("peso_medida.errorAlBorrarLaUnidad"));
};
