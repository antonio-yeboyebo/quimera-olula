import { MetaModelo } from "@olula/lib/dominio.ts";
import { NuevoPickingFijo, PickingFijo } from "./diseño.ts";
import { sinTexto } from "#/almacen/comun/dominio.ts";
import { tAlmacen } from "../i18n/index.ts";

type CamposReposicion = Pick<NuevoPickingFijo, "minimo" | "maximo" | "unidadReposicion">;

const esNumero = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

/**
 * Valida mínimo, máximo y unidad de reposición: mínimo >= 0, máximo > mínimo,
 * unidad > 0 y unidad <= máximo - mínimo.
 * Devuelve `true` si es válido o el mensaje del primer error.
 */
export const validarReposicionPickingFijo = (m: CamposReposicion): string | true => {
    if (!esNumero(m.minimo) || m.minimo < 0) return tAlmacen("picking_fijo.elMinimoDebeSerMayorO");
    if (!esNumero(m.maximo) || m.maximo <= m.minimo) return tAlmacen("picking_fijo.elMaximoDebeSerMayorQue");
    if (!esNumero(m.unidadReposicion) || m.unidadReposicion <= 0)
        return tAlmacen("picking_fijo.laUnidadDeReposicionDebeSer");
    if (m.unidadReposicion > m.maximo - m.minimo)
        return tAlmacen("picking_fijo.laUnidadDeReposicionNoPuede");
    return true;
};

export const validarNuevoPickingFijo = (m: NuevoPickingFijo): string | true => {
    if (sinTexto(m.articuloId)) return tAlmacen("picking_fijo.elArticuloEsObligatorio");
    if (sinTexto(m.ubicacionId)) return tAlmacen("picking_fijo.laUbicacionEsObligatoria");
    return validarReposicionPickingFijo(m);
};

const camposReposicion = {
    minimo: { requerido: true, tipo: "decimal" as const },
    maximo: { requerido: true, tipo: "decimal" as const },
    unidadReposicion: { requerido: true, tipo: "decimal" as const },
};

export const pickingFijoVacio = (): PickingFijo => ({
    id: "",
    articuloId: "",
    articulo: "",
    ubicacionId: "",
    ubicacion: "",
    almacenId: "",
    minimo: 0,
    maximo: 0,
    unidadReposicion: 0,
    stock: 0,
});

/** Constante estable (no función) para el formulario de alta. */
export const nuevoPickingFijoVacio: NuevoPickingFijo = {
    articuloId: "",
    ubicacionId: "",
    minimo: 0,
    maximo: 0,
    unidadReposicion: 0,
};

export const metaPickingFijo: MetaModelo<PickingFijo> = {
    campos: camposReposicion,
    validacion: validarReposicionPickingFijo,
};

export const metaNuevoPickingFijo: MetaModelo<NuevoPickingFijo> = {
    campos: {
        articuloId: { requerido: true },
        ubicacionId: { requerido: true },
        ...camposReposicion,
    },
    validacion: validarNuevoPickingFijo,
};
