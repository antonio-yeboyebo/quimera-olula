import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { CuentasAnuales } from "../diseño.ts";
import { textoValorCuentasAnuales } from "../dominio.ts";
import { tContabilidad } from "../../i18n/index.ts";

export type EstadoMaestroCuentasAnuales = "INICIAL" | "CREANDO";

export type ContextoMaestroCuentasAnuales = {
    estado: EstadoMaestroCuentasAnuales;
    informes: ListaActivaEntidades<CuentasAnuales>;
};

export const metaTablaCuentasAnuales: MetaTabla<CuentasAnuales> = [
    { id: "descripcion", get cabecera() { return tContabilidad("cuentas_anuales.descripcion"); } },
    { id: "tipo", get cabecera() { return tContabilidad("cuentas_anuales.tipo"); }, render: (c) => textoValorCuentasAnuales(c.tipo) },
    { id: "formato", get cabecera() { return tContabilidad("cuentas_anuales.formato"); }, render: (c) => textoValorCuentasAnuales(c.formato) },
    { id: "nivelDesglose", get cabecera() { return tContabilidad("cuentas_anuales.desglose"); }, render: (c) => textoValorCuentasAnuales(c.nivelDesglose) },
];

/** Filtro explícito: el metaFiltro por defecto usaría el `id` camelCase de la
 * columna como nombre de campo de API, y la API espera snake_case. */
export const metaFiltroCuentasAnuales: MetaFiltro = {
    descripcion: {
        id: "descripcion",
        campo: "descripcion",
        get label() { return tContabilidad("cuentas_anuales.descripcion"); },
        filtro: (valor) =>
            !valor || valor === ""
                ? null
                : ["descripcion", "~", valor as string],
    },
    tipo: {
        id: "tipo",
        campo: "tipo",
        get label() { return tContabilidad("cuentas_anuales.tipo"); },
        filtro: (valor) =>
            !valor || valor === "" ? null : ["tipo", "eq", valor as string],
    },
    ejercicioId: {
        id: "ejercicioId",
        campo: "ejercicio_id",
        get label() { return tContabilidad("cuentas_anuales.ejercicio"); },
        filtro: (valor) =>
            !valor || valor === ""
                ? null
                : ["ejercicio_id", "eq", valor as string],
    },
};

export const criteriaCuentasAnualesDefecto = (): Criteria => ({
    ...criteriaDefecto,
    orden: ["id", "DESC"],
});
