import { urlFicha } from "#/almacen/comun/fichas.ts";
import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Ubicacion } from "../../diseño.ts";
import { descripcionEstadoUbicacion } from "../../dominio.ts";
import { tAlmacen } from "../../../i18n/index.ts";

export type EstadoMaestroUbicacion = "INICIAL" | "CREANDO";

export type ContextoMaestroUbicacion = {
    estado: EstadoMaestroUbicacion;
    ubicaciones: ListaActivaEntidades<Ubicacion>;
};

export const metaTablaUbicacion: MetaTabla<Ubicacion> = [
    { id: "codigo", get cabecera() { return tAlmacen("ubicacion.codigo"); } },
    { id: "zona", get cabecera() { return tAlmacen("ubicacion.zona"); }, enlace: (u) => urlFicha.zona(u.idZona) },
    { id: "pasillo", get cabecera() { return tAlmacen("ubicacion.pasillo"); } },
    { id: "modulo", get cabecera() { return tAlmacen("ubicacion.modulo"); } },
    { id: "nivel", get cabecera() { return tAlmacen("ubicacion.nivel"); } },
    { id: "hueco", get cabecera() { return tAlmacen("ubicacion.hueco"); } },
    { id: "tipoUbicacion", get cabecera() { return tAlmacen("ubicacion.tipo"); }, enlace: (u) => urlFicha.tipoUbicacion(u.tipoUbicacionId) },
    { id: "estado", get cabecera() { return tAlmacen("ubicacion.estado"); }, render: (u) => descripcionEstadoUbicacion(u.estado) },
];
