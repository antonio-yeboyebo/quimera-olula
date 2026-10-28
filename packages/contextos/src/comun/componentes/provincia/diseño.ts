import { Entidad, Filtro, Orden } from "@olula/lib/diseño.ts";

export interface Provincia extends Entidad {
    id: string;
    nombre: string;
    paisId: string;
};

export type GetProvincias = (f: Filtro, o: Orden) => Promise<Provincia[]>;
