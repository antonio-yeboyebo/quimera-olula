import { Tarea } from "../comun/diseño.ts";

export type VistaAgenda = "dia" | "semana" | "mes";

export type BloquesProximas = {
    hoy: Tarea[];
    mañana: Tarea[];
    proximamente: Tarea[];
};
