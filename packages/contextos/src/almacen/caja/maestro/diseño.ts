import { urlFicha } from "#/almacen/comun/fichas.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Caja } from "../diseño.ts";
import { tAlmacen } from "../../i18n/index.ts";

export type EstadoMaestroCaja = "INICIAL" | "CREANDO";

export type ContextoMaestroCaja = {
    estado: EstadoMaestroCaja;
    cajas: ListaActivaEntidades<Caja>;
};

export const metaTablaCaja: MetaTabla<Caja> = [
    { id: "lpn", get cabecera() { return tAlmacen("caja.codigo"); } },
    { id: "ubicacion", get cabecera() { return tAlmacen("caja.ubicacion"); }, enlace: (c) => urlFicha.ubicacion(c.idUbicacion) },
];
