import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Provincia } from "../diseño.ts";
import { tComun } from "../../i18n/index.ts";

export type EstadoMaestroProvincia = "INICIAL" | "CREANDO";

export type ContextoMaestroProvincia = {
    estado: EstadoMaestroProvincia;
    provincias: ListaActivaEntidades<Provincia>;
};

export const metaTablaProvincia: MetaTabla<Provincia> = [
    { id: "nombre", get cabecera() { return tComun("provincia.provincia"); } },
    { id: "codigo", get cabecera() { return tComun("provincia.codigo"); } },
    { id: "paisId", get cabecera() { return tComun("provincia.pais"); } },
    { id: "nombrePais", get cabecera() { return tComun("provincia.nombreDelPais"); } },
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

export const metaFiltroProvincia: MetaFiltro = {
    get nombre() { return filtroTexto("nombre", tComun("provincia.provincia")); },
    get pais_id() { return filtroTexto("pais_id", tComun("provincia.pais")); },
};

export const criteriaProvinciasDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["nombre", "ASC"],
});
