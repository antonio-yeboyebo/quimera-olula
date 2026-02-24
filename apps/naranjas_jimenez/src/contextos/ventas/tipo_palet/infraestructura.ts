import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import { GetItemsListaTipoPalet, ItemListaTipoPalet } from "./diseño.ts";

const baseUrl = new ApiUrls().TIPO_PALET;

type ItemListTipoPaletApi = {
    id: string;
    descripcion: string;
    tipo_envase_id: string;
    cantidad_envases: number;
};

const itemListTipoPaletDesdeApi = (item: ItemListTipoPaletApi): ItemListaTipoPalet => ({
    id: item.id,
    descripcion: item.descripcion,
    idTipoEnvase: item.tipo_envase_id,
    cantidadEnvase: item.cantidad_envases,
})

export const getItemsListaTipoPalet: GetItemsListaTipoPalet = async (filtro, orden) => {

    return RestAPI.get<{ datos: ItemListTipoPaletApi[] }>(
        `${baseUrl}/items_lista` + criteriaQuery(filtro, orden)
    ).then((respuesta) => respuesta.datos.map(itemListTipoPaletDesdeApi));
}
