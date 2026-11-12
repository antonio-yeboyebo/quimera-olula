import { PeticionPivot, Presentacion } from "../cubo/diseño.ts";

export type ResumenVista = {
    id: string;
    nombre: string;
    cuboId: string;
    actualizadoEn: Date;
};

export type Vista = ResumenVista & {
    peticion: PeticionPivot;
    presentacion: Partial<Presentacion>;
};

export type NuevaVista = {
    cuboId: string;
    nombre: string;
    peticion: PeticionPivot;
    presentacion: Presentacion;
};

export type CambiosVista = Partial<Pick<NuevaVista, "nombre" | "peticion" | "presentacion">>;

export type GetVistas = (cuboId?: string) => Promise<ResumenVista[]>;

export type GetVista = (id: string) => Promise<Vista>;

export type CrearVista = (vista: NuevaVista) => Promise<string>;

export type CambiarVista = (id: string, cambios: CambiosVista) => Promise<void>;

export type BorrarVista = (id: string) => Promise<void>;
