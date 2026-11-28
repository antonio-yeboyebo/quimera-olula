import { MetaModelo } from "@olula/lib/dominio.ts";
import { CambiosLineaInventario, LineaInventario } from "../diseño.ts";
import { tAlmacen } from "../../i18n/index.ts";

/** Longitud de `lecturasinvetariocsv.localizacion`. */
export const LONGITUD_UBICACION = 18;

export const metaCambiosLineaInventario: MetaModelo<CambiosLineaInventario> = {
    campos: {
        cantidad: {
            tipo: "decimal",
            requerido: true,
            validacion: (m) => m.cantidad >= 0 || tAlmacen("inventario.laCantidadDebeSerMayorO"),
        },
        motivo: { requerido: false },
        ubicacion: {
            requerido: false,
            validacion: (m) =>
                (m.ubicacion ?? "").trim().length <= LONGITUD_UBICACION ||
                tAlmacen("inventario.laUbicacionNoPuedeTenerMas", { LONGITUD_UBICACION }),
        },
    },
};

/** Valores iniciales del modal de cambio: cantidad contada, motivo y ubicación de la línea. */
export const lineaACambios = (linea: LineaInventario): CambiosLineaInventario => ({
    cantidad: linea.cantidadFinal,
    motivo: linea.motivo ?? "",
    ubicacion: linea.ubicacion ?? "",
});

/**
 * Aviso del modal para una línea cargada de fichero: sus lecturas se
 * conservan y, si la cantidad cambia, el servidor añade una de ajuste.
 */
export const avisoLecturas = (lecturas: number): string =>
    tAlmacen("inventario.laLineaVieneDeValorDe", { valor: lecturas === 1 ? tAlmacen("inventario.t1Lectura") : `${lecturas} lecturas` });
