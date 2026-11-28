import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Almacen } from "../../diseño.ts";
import { tAlmacen } from "../../../i18n/index.ts";

export type EstadoMaestroAlmacen = "INICIAL" | "CREANDO";

export type ContextoMaestroAlmacen = {
    estado: EstadoMaestroAlmacen;
    almacenes: ListaActivaEntidades<Almacen>;
};

export const metaTablaAlmacen: MetaTabla<Almacen> = [
    { id: "id", get cabecera() { return tAlmacen("almacen.codigoAlmacen"); } },
    { id: "nombre", get cabecera() { return tAlmacen("almacen.nombre"); } },
];
