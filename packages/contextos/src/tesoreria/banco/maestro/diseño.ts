import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Banco } from "../diseño.ts";
import { tTesoreria } from "../../i18n/index.ts";

export type EstadoMaestroBanco = "INICIAL" | "CREANDO";

export type ContextoMaestroBanco = {
    estado: EstadoMaestroBanco;
    bancos: ListaActivaEntidades<Banco>;
};

export const metaTablaBanco: MetaTabla<Banco> = [
    { id: "id", get cabecera() { return tTesoreria("banco.nDeEntidad"); } },
    { id: "nombre", get cabecera() { return tTesoreria("banco.nombre"); } },
    { id: "nombreProveedor", get cabecera() { return tTesoreria("banco.acreedor"); } },
    { id: "bicDefecto", get cabecera() { return tTesoreria("banco.bicPorDefecto"); } },
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

export const metaFiltroBanco: MetaFiltro = {
    get id() { return filtroTexto("id", tTesoreria("banco.nDeEntidad")); },
    get nombre() { return filtroTexto("nombre", tTesoreria("banco.nombre")); },
};

export const criteriaBancosDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["id", "ASC"],
});
