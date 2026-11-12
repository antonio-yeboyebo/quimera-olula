import { Contexto } from "@olula/lib/diseño.ts";
import { TipoTarea } from "../comun/diseño.ts";
import { Posicion } from "../comun/geolocalizacion.ts";

export type TareaVisita = {
    id: string;
    titulo: string;
    tipo: TipoTarea;
    fecha: string;
    hora: string | null;
    completada: boolean;
    enCurso: boolean;
    fechaInicio: string | null;
    horaInicio: string | null;
    posicionInicio: Posicion | null;
    nota: string;
    idTrato: string | null;
    codCliente: string | null;
    nombreCliente: string | null;
    interlocutor: string | null;
};

export type TareaVisitaAPI = {
    idtarea: number;
    titulo: string;
    tipo: TipoTarea;
    fecha: string;
    hora: string | null;
    completada: boolean;
    encurso: boolean | null;
    fechainicio: string | null;
    horainicio: string | null;
    latitudinicio: number | null;
    longitudinicio: number | null;
    nota: string | null;
    idtrato: number | null;
    codcliente: string | null;
    codclienteincidencia: string | null;
    nombrecliente: string | null;
    interlocutor: string | null;
};

export type Contacto = {
    codigo: string;
    nombre: string;
};

export type CausaPerdida = {
    id: string;
    descripcion: string;
};

export type SiguientePaso = "ninguno" | "presupuesto" | "pedido";

export type EstadoTrato = "Ganado" | "Perdido";

export type EstadoVisita = "CARGANDO" | "PENDIENTE" | "EN_CURSO" | "FINALIZANDO" | "CERRANDO_TRATO" | "TERMINADA";

export type ContextoVisita = Contexto<EstadoVisita> & {
    tarea: TareaVisita | null;
    contactos: Contacto[];
    causas: CausaPerdida[];
    nota: string;
    interlocutor: string | null;
    horaFin: string;
    siguientePaso: SiguientePaso;
    generarSiguiente: boolean;
    estadoTrato: EstadoTrato | null;
    idCausa: string | null;
    tratoCerrado: boolean;
    errores: string[];
};

export type CambioVisita = Partial<
    Pick<ContextoVisita, "nota" | "interlocutor" | "horaFin" | "siguientePaso" | "generarSiguiente" | "estadoTrato" | "idCausa">
>;

export type FinalizacionAPI = {
    completada: true;
    fechafin: string;
    horafin: string;
    latitudfin: number | null;
    longitudfin: number | null;
    nota: string;
    interlocutor: string | null;
};
