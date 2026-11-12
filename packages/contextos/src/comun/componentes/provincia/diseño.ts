import { Entidad, Filtro, Orden, Paginacion, RespuestaLista2 } from "@olula/lib/diseño.ts";

export interface Provincia extends Entidad {
    id: string;
    nombre: string;
}

export type GetProvincias = (f: Filtro, o: Orden, p?: Paginacion) => Promise<RespuestaLista2<Provincia>>;
