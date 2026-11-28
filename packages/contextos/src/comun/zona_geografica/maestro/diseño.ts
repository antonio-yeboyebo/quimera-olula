import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ZonaGeografica } from "../diseño.ts";
import { tComun } from "../../i18n/index.ts";

export type EstadoMaestroZonaGeografica = "INICIAL" | "CREANDO";

export type ContextoMaestroZonaGeografica = {
    estado: EstadoMaestroZonaGeografica;
    zonasGeograficas: ListaActivaEntidades<ZonaGeografica>;
};

export const metaTablaZonaGeografica: MetaTabla<ZonaGeografica> = [
    { id: "id", get cabecera() { return tComun("zonaGeografica.codigo"); } },
    { id: "descripcion", get cabecera() { return tComun("zonaGeografica.descripcion"); } },
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

export const metaFiltroZonaGeografica: MetaFiltro = {
    get id() { return filtroTexto("id", tComun("zonaGeografica.codigo")); },
    get descripcion() { return filtroTexto("descripcion", tComun("zonaGeografica.descripcion")); },
};

export const criteriaZonasGeograficasDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["id", "ASC"],
});
