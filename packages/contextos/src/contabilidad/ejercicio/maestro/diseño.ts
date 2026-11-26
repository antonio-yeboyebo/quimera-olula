import { MetaTabla } from "@olula/componentes/index.js";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Ejercicio } from "../diseño.ts";
import { textoEstadoEjercicio } from "../dominio.ts";
import { tContabilidad } from "../../i18n/index.ts";

export type EstadoMaestroEjercicio = "INICIAL" | "CREANDO";

export type ContextoMaestroEjercicio = {
    estado: EstadoMaestroEjercicio;
    ejercicios: ListaActivaEntidades<Ejercicio>;
};

export const metaTablaEjercicio: MetaTabla<Ejercicio> = [
    { id: "id", get cabecera() { return tContabilidad("ejercicio.codigo"); } },
    { id: "nombre", get cabecera() { return tContabilidad("ejercicio.nombre"); } },
    { id: "fechaInicio", get cabecera() { return tContabilidad("ejercicio.inicio"); }, tipo: "fecha" },
    { id: "fechaFin", get cabecera() { return tContabilidad("ejercicio.fin"); }, tipo: "fecha" },
    { id: "estado", get cabecera() { return tContabilidad("ejercicio.estado"); }, render: (e) => textoEstadoEjercicio(e.estado) },
];

export const criteriaEjerciciosDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["fecha_inicio", "DESC"],
});
