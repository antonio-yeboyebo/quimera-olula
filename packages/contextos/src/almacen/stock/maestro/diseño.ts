import { urlFicha } from "#/almacen/comun/fichas.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { StockItem } from "../diseño.ts";
import { tAlmacen } from "../../i18n/index.ts";

export type EstadoMaestroStock = "INICIAL";

export type ContextoMaestroStock = {
    estado: EstadoMaestroStock;
    stocks: ListaActivaEntidades<StockItem>;
};

const formatearNumero = (valor: number) => valor?.toLocaleString("es-ES") ?? "";

export const metaTablaStock: MetaTabla<StockItem> = [
    {
        id: "articulo",
        get cabecera() { return tAlmacen("stock.articulo"); },
        render: (s) => [s.articulo, s.articuloId].filter(Boolean).join(" - "),
        enlace: (s) => urlFicha.articulo(s.articuloId),
    },
    { id: "almacen", get cabecera() { return tAlmacen("stock.almacen"); }, enlace: (s) => urlFicha.almacen(s.almacenId) },
    {
        id: "cantidad_fisica",
        get cabecera() { return tAlmacen("stock.cantidadFisica"); },
        tipo: "numero",
        render: (s) => formatearNumero(s.cantidadFisica),
    },
    {
        id: "cantidad_disponible",
        get cabecera() { return tAlmacen("stock.disponible"); },
        tipo: "numero",
        render: (s) => formatearNumero(s.cantidadDisponible),
    },
    {
        id: "cantidad_reservada",
        get cabecera() { return tAlmacen("stock.reservada"); },
        tipo: "numero",
        render: (s) => formatearNumero(s.cantidadReservada),
    },
    {
        id: "cantidad_pendiente",
        get cabecera() { return tAlmacen("stock.porRecibir"); },
        tipo: "numero",
        render: (s) => formatearNumero(s.cantidadPendiente),
    },
];
