import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { AlcanceRegeneracion, CodigoBalance } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

export type EstadoMaestroCodigoBalance = "INICIAL" | "CREANDO" | "REGENERANDO";

export type ContextoMaestroCodigoBalance = {
    estado: EstadoMaestroCodigoBalance;
    codigosBalance: ListaActivaEntidades<CodigoBalance>;
    alcanceRegeneracion: AlcanceRegeneracion | null;
};

export const metaTablaCodigoBalance: MetaTabla<CodigoBalance> = [
    { id: "id", get cabecera() { return tContabilidad("codigo_balance.codigo"); } },
    { id: "naturaleza", get cabecera() { return tContabilidad("codigo_balance.nat"); } },
    { id: "descripcion1", get cabecera() { return tContabilidad("codigo_balance.nivel1"); } },
    { id: "descripcion2", get cabecera() { return tContabilidad("codigo_balance.nivel2"); } },
    { id: "descripcion3", get cabecera() { return tContabilidad("codigo_balance.nivel3"); } },
    { id: "descripcion4", get cabecera() { return tContabilidad("codigo_balance.nivel4"); } },
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

/** Filtro explícito con los nombres de campo de la API. */
export const metaFiltroCodigoBalance: MetaFiltro = {
    get id() { return filtroTexto("id", tContabilidad("codigo_balance.codigo")); },
    naturaleza: {
        id: "naturaleza",
        campo: "naturaleza",
        get label() { return tContabilidad("codigo_balance.naturalezaAPPgIg"); },
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["naturaleza", "=", (valor as string).toUpperCase()];
        },
    },
    get descripcion3() { return filtroTexto("descripcion3", tContabilidad("codigo_balance.nivel3")); },
    get descripcion4() { return filtroTexto("descripcion4", tContabilidad("codigo_balance.nivel4")); },
};

/** Por código, como el maestro de Eneboo. */
export const criteriaCodigosBalanceDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["id", "ASC"],
});
