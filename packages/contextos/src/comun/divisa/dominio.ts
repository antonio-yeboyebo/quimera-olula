import { MetaModelo } from "@olula/lib/dominio.ts";
import { CambiosDivisa, Divisa, NuevaDivisa } from "./diseño.ts";
import { tComun } from "../i18n/index.ts";

export const REGLA_DIVISA = "comun.divisa";

/** Valores por defecto de `divisas.mtd`: tasa 1 y 2 cifras decimales. */
export const nuevoDivisaVacio = (): NuevaDivisa => ({
    id: "",
    descripcion: "",
    tasaConversion: 1,
    fecha: null,
    codigoIso: "",
    simbolo: "",
    monedasBilletes: "",
    cifrasDecimales: 2,
});

export const divisaVacio = (): Divisa => nuevoDivisaVacio();

export const etiquetaDivisa = (d: Divisa): string => (d.descripcion ? `${d.id} — ${d.descripcion}` : d.id);

const campos = {
    descripcion: { requerido: false, maximo: 100 },
    tasaConversion: {
        requerido: true,
        tipo: "decimal" as const,
        decimales: 6,
        validacion: (d: NuevaDivisa) =>
            Math.abs(Number(d.tasaConversion)) < 1_000_000 || tComun("divisas.laTasaAdmite6CifrasEnteras"),
    },
    fecha: { requerido: false, tipo: "fecha" as const },
    codigoIso: { requerido: false, maximo: 3 },
    simbolo: { requerido: false, maximo: 10 },
    monedasBilletes: { requerido: false },
    cifrasDecimales: { requerido: true, tipo: "entero" as const, minimo: 0 },
};

export const metaDivisa: MetaModelo<Divisa> = { campos };

export const metaNuevoDivisa: MetaModelo<NuevaDivisa> = {
    campos: { id: { requerido: true, maximo: 3 }, ...campos },
};

const CAMPOS_EDITABLES: (keyof CambiosDivisa)[] = [
    "descripcion", "tasaConversion", "fecha", "codigoIso", "simbolo", "monedasBilletes", "cifrasDecimales",
];

const mismoValor = (a: unknown, b: unknown) =>
    a instanceof Date || b instanceof Date
        ? (a as Date | null)?.getTime?.() === (b as Date | null)?.getTime?.()
        : a === b;

export const cambiosDivisa = (previa: Divisa, actual: Divisa): CambiosDivisa => {
    const cambios: Record<string, unknown> = {};
    for (const campo of CAMPOS_EDITABLES) {
        if (!mismoValor(actual[campo], previa[campo])) cambios[campo] = actual[campo];
    }
    return cambios as CambiosDivisa;
};
