import { fuentesPrecioArticulo, MetaModelo, puede } from "@olula/lib/dominio.ts";
import { NuevoPrecioArticulo, PrecioArticulo } from "./diseño.ts";
import { tVentas } from "../i18n/index.ts";

type CondicionPrecio = Pick<PrecioArticulo, "cantidadMin" | "cantidadMax" | "dtoPorcentual" | "pvp">;

/**
 * El tramo es válido si alguno de sus extremos es 0 (sin límite) o el mínimo
 * no supera al máximo.
 */
export const tramoValido = (m: CondicionPrecio): string | true => {
    const minimo = Number(m.cantidadMin) || 0;
    const maximo = Number(m.cantidadMax) || 0;
    return minimo && maximo && minimo > maximo
        ? tVentas("precioArticulo.desdeMayorQueHasta")
        : true;
};

const camposCondicion = {
    cantidadMin: { tipo: "decimal" as const, positivo: true },
    cantidadMax: { tipo: "decimal" as const, positivo: true },
    dtoPorcentual: { tipo: "decimal" as const, positivo: true, maximo: 100 },
    pvp: { tipo: "moneda" as const, positivo: true },
};

export const metaNuevoPrecioArticulo: MetaModelo<NuevoPrecioArticulo> = {
    campos: {
        articuloId: { requerido: true, tipo: "autocompletar" },
        ...camposCondicion,
    },
    validacion: tramoValido,
};

export const metaPrecioArticulo: MetaModelo<PrecioArticulo> = {
    campos: {
        articuloId: { requerido: true, tipo: "autocompletar" },
        ...camposCondicion,
    },
    validacion: tramoValido,
};

export const nuevoPrecioArticuloVacio = (): NuevoPrecioArticulo => ({
    articuloId: "",
    descripcionArticulo: "",
    cantidadMin: 0,
    cantidadMax: 0,
    dtoPorcentual: 0,
    pvp: 0,
});

/** Texto del tramo para la lista: "Todas", "Desde 10", "Hasta 9", "10 – 50". */
export const textoTramo = (p: Pick<PrecioArticulo, "cantidadMin" | "cantidadMax">): string => {
    const { cantidadMin: minimo, cantidadMax: maximo } = p;
    if (!minimo && !maximo) return tVentas("precioArticulo.tramo.todas");
    if (!maximo) return tVentas("precioArticulo.tramo.desde", { minimo });
    if (!minimo) return tVentas("precioArticulo.tramo.hasta", { maximo });
    return `${minimo} – ${maximo}`;
};

/** Con descuento, el pvp de la fila no se usa: el precio sale de tarifa o ficha. */
export const pvpIgnorado = (p: Pick<PrecioArticulo, "dtoPorcentual">): boolean =>
    Number(p.dtoPorcentual) !== 0;

export const descripcionPrecioArticulo = (p: PrecioArticulo): string =>
    p.descripcionArticulo ? `${p.articuloId} - ${p.descripcionArticulo}` : p.articuloId;

/**
 * La pestaña de precios por artículo del cliente solo tiene sentido si el
 * servidor usa la fuente `precios_articulos` (whoami:
 * `config.ventas.precio_articulo`) y el usuario puede consultarla.
 */
export const muestraPreciosArticulo = (): boolean =>
    fuentesPrecioArticulo().includes("precios_articulos") &&
    puede("ventas.precio_articulo");
