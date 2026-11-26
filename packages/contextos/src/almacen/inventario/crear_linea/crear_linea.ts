import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { NuevaLineaInventario } from "../diseño.ts";
import { tAlmacen } from "../../i18n/index.ts";

export const metaNuevaLineaInventario: MetaModelo<NuevaLineaInventario> = {
    campos: {
        articuloId: { requerido: true, validacion: (m) => stringNoVacio(m.articuloId) },
        cantidad: {
            tipo: "decimal",
            requerido: true,
            validacion: (m) => m.cantidad >= 0 || tAlmacen("inventario.laCantidadDebeSerMayorO"),
        },
        motivo: { requerido: false },
    },
};

export const nuevaLineaInventarioVacia = (): NuevaLineaInventario => ({
    articuloId: "",
    cantidad: 0,
    motivo: "",
});
