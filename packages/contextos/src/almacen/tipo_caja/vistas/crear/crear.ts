import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoTipoCaja } from "../../diseño.js";
import { tAlmacen } from "../../../i18n/index.ts";

export const metaNuevoTipoCaja: MetaModelo<NuevoTipoCaja> = {
    campos: {
        descripcion: { requerido: true },
        sku: { requerido: false },
        capacidad: { requerido: false, tipo: "decimal" },
        prefijo: { requerido: false },
    },
    onChange: (modelo, campo) => {
        if (campo === "sku" && (modelo.sku === null || modelo.sku === "")) {
            return { ...modelo, sku: null, capacidad: null };
        }
        return modelo;
    },
    validacion: (modelo: NuevoTipoCaja) => {
        if (modelo.sku && !modelo.capacidad) {
            return tAlmacen("tipo_caja.laCapacidadEsRequerida");
        }
        return true;
    }
};
