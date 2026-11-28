import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Divisa } from "../diseño.ts";
import { tComun } from "../../i18n/index.ts";

export type EstadoMaestroDivisa = "INICIAL" | "CREANDO";

export type ContextoMaestroDivisa = {
    estado: EstadoMaestroDivisa;
    divisas: ListaActivaEntidades<Divisa>;
};

export const metaTablaDivisa: MetaTabla<Divisa> = [
    { id: "id", get cabecera() { return tComun("divisas.codigo"); } },
    { id: "descripcion", get cabecera() { return tComun("divisas.descripcion"); } },
    { id: "tasaConversion", get cabecera() { return tComun("divisas.tasaDeConversion"); }, tipo: "numero" },
    { id: "fecha", get cabecera() { return tComun("divisas.fechaDeActualizacion"); }, tipo: "fecha" },
    { id: "simbolo", get cabecera() { return tComun("divisas.simbolo"); } },
    { id: "codigoIso", get cabecera() { return tComun("divisas.codigoIso"); } },
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

export const metaFiltroDivisa: MetaFiltro = {
    get id() { return filtroTexto("id", tComun("divisas.codigo")); },
    get descripcion() { return filtroTexto("descripcion", tComun("divisas.descripcion")); },
};

export const criteriaDivisasDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["id", "ASC"],
});
