import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Pais } from "../diseño.ts";
import { tComun } from "../../i18n/index.ts";

export type EstadoMaestroPais = "INICIAL" | "CREANDO";

export type ContextoMaestroPais = {
    estado: EstadoMaestroPais;
    paises: ListaActivaEntidades<Pais>;
};

export const metaTablaPais: MetaTabla<Pais> = [
    { id: "id", get cabecera() { return tComun("paises.codigo"); } },
    { id: "nombre", get cabecera() { return tComun("paises.nombre"); } },
    { id: "codiso", get cabecera() { return tComun("paises.codigoISO"); } },
    { id: "descripcionZona", get cabecera() { return tComun("paises.zonaGeografica"); } },
    { id: "enUe", get cabecera() { return tComun("paises.uE"); }, tipo: "booleano" },
    { id: "zonaSepa", cabecera: "SEPA", tipo: "booleano" },
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

export const metaFiltroPais: MetaFiltro = {
    get id() { return filtroTexto("id", tComun("paises.codigo")); },
    get nombre() { return filtroTexto("nombre", tComun("paises.nombre")); },
};

export const criteriaPaisesDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["id", "ASC"],
});
