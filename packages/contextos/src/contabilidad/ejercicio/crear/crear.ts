import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoEjercicio } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

export const metaNuevoEjercicio: MetaModelo<NuevoEjercicio> = {
    campos: {
        id: { requerido: true, maximo: 4 },
        nombre: { requerido: true },
        fechaInicio: { requerido: true, tipo: "fecha" },
        fechaFin: { requerido: true, tipo: "fecha" },
        digitosSubcuenta: { requerido: true, tipo: "numero" },
        ejercicioOrigenPgc: { requerido: false, tipo: "selector" },
        series: { requerido: false },
    },
    validacion: (m) => {
        if (m.fechaInicio > m.fechaFin) {
            return tContabilidad("ejercicio.laFechaDeInicioDelEjercicio");
        }
        const digitos = Number(m.digitosSubcuenta);
        if (!m.ejercicioOrigenPgc && (digitos < 5 || digitos > 15)) {
            return tContabilidad("ejercicio.laLongitudDeLaSubcuentaDebe");
        }
        return true;
    },
};
