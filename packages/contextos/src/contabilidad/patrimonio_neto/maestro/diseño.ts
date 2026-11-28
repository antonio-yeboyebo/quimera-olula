import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { PatrimonioNeto } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

export type EstadoMaestroPatrimonioNeto = "INICIAL" | "CREANDO";

export type ContextoMaestroPatrimonioNeto = {
    estado: EstadoMaestroPatrimonioNeto;
    informes: ListaActivaEntidades<PatrimonioNeto>;
};

export const metaTablaPatrimonioNeto: MetaTabla<PatrimonioNeto> = [
    { id: "descripcion", get cabecera() { return tContabilidad("patrimonio_neto.descripcion"); } },
    { id: "ejercicioId", get cabecera() { return tContabilidad("patrimonio_neto.ejercicioActual"); } },
    { id: "ejercicioAnteriorId", get cabecera() { return tContabilidad("patrimonio_neto.ejercicioX1"); } },
    { id: "ejercicioAnteriorAnteriorId", get cabecera() { return tContabilidad("patrimonio_neto.ejercicioX2"); } },
];

/** Filtro explícito: la API espera los nombres en snake_case. */
export const metaFiltroPatrimonioNeto: MetaFiltro = {
    descripcion: {
        id: "descripcion",
        campo: "descripcion",
        get label() { return tContabilidad("patrimonio_neto.descripcion"); },
        filtro: (valor) =>
            !valor || valor === ""
                ? null
                : ["descripcion", "~", valor as string],
    },
    ejercicioId: {
        id: "ejercicioId",
        campo: "ejercicio_id",
        get label() { return tContabilidad("patrimonio_neto.ejercicio"); },
        filtro: (valor) =>
            !valor || valor === ""
                ? null
                : ["ejercicio_id", "eq", valor as string],
    },
};

export const criteriaPatrimonioNetoDefecto = (): Criteria => ({
    ...criteriaDefecto,
    orden: ["id", "DESC"],
});
