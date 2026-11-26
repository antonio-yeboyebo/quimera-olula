import { MetaModelo } from "@olula/lib/dominio.js";
import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { NuevaRegularizacionIva, RegularizacionIva } from "../diseño.ts";
import {
    cambiarNuevaRegularizacion,
    fechasTrimestre,
    trimestreSiguiente,
} from "../dominio.ts";
import { tContabilidad } from "../../i18n/index.ts";

export const metaNuevaRegularizacionIva: MetaModelo<NuevaRegularizacionIva> = {
    campos: {
        ejercicioId: { requerido: true, maximo: 4 },
        trimestre: { requerido: true, tipo: "selector" },
        fechaInicio: { requerido: true, tipo: "fecha" },
        fechaFin: { requerido: true, tipo: "fecha" },
        fechaAsiento: { requerido: false, tipo: "fecha" },
        codigoSubcuentaDeudora: { requerido: false },
        codigoSubcuentaAcreedora: { requerido: false },
    },
    validacion: (m) =>
        !m.fechaInicio || !m.fechaFin || m.fechaInicio <= m.fechaFin
            ? true
            : tContabilidad("regularizacion_iva.laFechaDeInicioDebeSer"),
    onChange: (modelo, campo) => cambiarNuevaRegularizacion(modelo, campo),
};

export const nuevaRegularizacionIvaInicial = (
    regularizaciones: Pick<RegularizacionIva, "ejercicioId" | "periodo">[] = [],
    ejercicioId: string = ejercicioActual(),
): NuevaRegularizacionIva => {
    const trimestre = trimestreSiguiente(regularizaciones, ejercicioId);
    const fechas = fechasTrimestre(
        Number.parseInt(ejercicioId, 10) || new Date().getFullYear(),
        trimestre === "OTRO" ? "T1" : trimestre
    );
    return {
        ejercicioId,
        trimestre,
        ...fechas,
        fechaAsiento: null,
        codigoSubcuentaDeudora: "",
        codigoSubcuentaAcreedora: "",
    };
};
