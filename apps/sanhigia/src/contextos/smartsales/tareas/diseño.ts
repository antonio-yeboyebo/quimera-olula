import { TipoTarea } from "../comun/diseño.ts";

export type TareaAPI = {
    idtarea: number;
    titulo: string;
    fecha: string;
    hora: string | null;
    tipo: TipoTarea;
    completada: boolean;
    encurso: boolean | null;
    nombrecliente: string | null;
    nombrecontactotrato: string | null;
};

export type FiltroTareasRango = {
    desde: string;
    hasta: string;
    agente: string | null;
    conAtrasadas?: boolean;
};
