import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { FuncionZona, Zona } from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

export const FUNCION_ZONA_POR_DEFECTO: FuncionZona = "RESERVA";

export const funcionesZona: { valor: FuncionZona; descripcion: string }[] = [
    { valor: "RECEPCION", get descripcion() { return tAlmacen("zona.recepcion"); } },
    { valor: "CUARENTENA", get descripcion() { return tAlmacen("zona.cuarentena"); } },
    { valor: "RESERVA", get descripcion() { return tAlmacen("zona.reserva"); } },
    { valor: "PICKING", get descripcion() { return tAlmacen("zona.picking"); } },
    { valor: "PREPARACION", get descripcion() { return tAlmacen("zona.preparacion"); } },
    { valor: "EXPEDICION", get descripcion() { return tAlmacen("zona.expedicion"); } },
    { valor: "TRANSITO", get descripcion() { return tAlmacen("zona.transito"); } },
];

export const descripcionFuncionZona = (funcion: string): string =>
    funcionesZona.find((f) => f.valor === funcion)?.descripcion ?? funcion;

export const zonaVacia = (): Zona => ({
    id: "",
    codigo: "",
    almacenId: "",
    descripcion: null,
    funcion: FUNCION_ZONA_POR_DEFECTO,
    clasesAdmitidas: [],
    admiteSinClase: true,
});

export const metaZona: MetaModelo<Zona> = {
    campos: {
        codigo: { requerido: true, validacion: (m: Zona) => stringNoVacio(m.codigo) },
        almacenId: { requerido: true, validacion: (m: Zona) => stringNoVacio(m.almacenId) },
        descripcion: { requerido: false },
        funcion: { requerido: true, validacion: (m: Zona) => stringNoVacio(m.funcion) },
        clasesAdmitidas: { requerido: false },
        admiteSinClase: { tipo: "checkbox" },
    },
};
