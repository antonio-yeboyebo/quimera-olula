import { Filtro, Orden } from "@olula/lib/diseño.js";

export type ItemListaVariedad = {
    id: string;
    descripcion: string;
};


export type GetItemsListaVariedad = (filtro: Filtro, orden: Orden) => Promise<ItemListaVariedad[]>;