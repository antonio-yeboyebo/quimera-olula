import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Familia } from "../../diseño.ts";
import { tAlmacen } from "../../../i18n/index.ts";

export type EstadoMaestroFamilia = "INICIAL" | "CREANDO";

export type ContextoMaestroFamilia = {
    estado: EstadoMaestroFamilia;
    familias: ListaActivaEntidades<Familia>;
};

export const metaTablaFamilia: MetaTabla<Familia> = [
    { id: "id", get cabecera() { return tAlmacen("familia.codigoFamilia2"); } },
    { id: "descripcion", get cabecera() { return tAlmacen("familia.descripcion2"); } },
];
