import { ResumenVista } from "../../../vista/diseño.ts";
import { Arbol, Cubo, Historial, PeticionPivot, Presentacion } from "../../diseño.ts";

export type EstadoNavegador = "CARGANDO" | "SIN_CUBOS" | "NAVEGANDO";

export type ContextoNavegador = {
    estado: EstadoNavegador;
    cubos: Cubo[];
    cubo: Cubo | null;
    peticion: PeticionPivot | null;
    presentacion: Presentacion;
    arbol: Arbol | null;
    truncado: boolean;
    historial: Historial | null;
    vistas: ResumenVista[];
    vista: ResumenVista | null;
};
