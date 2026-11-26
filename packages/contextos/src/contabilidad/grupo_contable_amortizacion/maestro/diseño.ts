import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { GrupoContableAmortizacion } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

export type EstadoMaestroGrupoContableAmortizacion = "INICIAL" | "CREANDO";

export type ContextoMaestroGrupoContableAmortizacion = {
    estado: EstadoMaestroGrupoContableAmortizacion;
    grupos: ListaActivaEntidades<GrupoContableAmortizacion>;
};

export const metaTablaGrupoContableAmortizacion: MetaTabla<GrupoContableAmortizacion> = [
    { id: "id", get cabecera() { return tContabilidad("grupo_contable_amortizacion.codigo"); } },
    { id: "descripcion", get cabecera() { return tContabilidad("grupo_contable_amortizacion.descripcion"); } },
    { id: "subcuentaElemento", get cabecera() { return tContabilidad("grupo_contable_amortizacion.sElemento"); } },
    { id: "subcuentaAmortizacion", get cabecera() { return tContabilidad("grupo_contable_amortizacion.sAmortizacion"); } },
    { id: "subcuentaGasto", get cabecera() { return tContabilidad("grupo_contable_amortizacion.sGastos"); } },
    { id: "subcuentaPerdidas", get cabecera() { return tContabilidad("grupo_contable_amortizacion.sPerdidas"); } },
    { id: "subcuentaGanancias", get cabecera() { return tContabilidad("grupo_contable_amortizacion.sGanancias"); } },
];

const filtroTexto = (campo: string, label: string) => ({
    id: campo,
    campo,
    label,
    filtro: (valor: unknown) => {
        if (!valor || valor === "") return null;
        return [campo, "~", valor as string] as [string, string, string];
    },
});

export const metaFiltroGrupoContableAmortizacion: MetaFiltro = {
    get id() { return filtroTexto("id", tContabilidad("grupo_contable_amortizacion.codigo")); },
    get descripcion() { return filtroTexto("descripcion", tContabilidad("grupo_contable_amortizacion.descripcion")); },
};

export const criteriaGruposDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["id", "ASC"],
});
