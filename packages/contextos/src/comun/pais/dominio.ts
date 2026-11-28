import { MetaModelo } from "@olula/lib/dominio.ts";
import { CambiosPais, DatosPais, NuevoPais, Pais } from "./diseño.ts";
import { tComun } from "../i18n/index.ts";

export const REGLA_PAIS = "comun.pais";

export const nuevoPaisVacio = (): NuevoPais => ({
    id: "",
    nombre: "",
    codiso: "",
    codigoIsoAlpha2: "",
    codigoIsoAlpha3: "",
    enUe: false,
    zonaId: "",
    zonaSepa: false,
    validarProvincias: false,
    exigirValidacion: false,
    funcionValidacion: "",
});

export const paisVacio = (): Pais => ({ ...nuevoPaisVacio(), descripcionZona: "" });

export const etiquetaPais = (p: Pais): string => (p.nombre ? `${p.id} — ${p.nombre}` : p.id);

/** `paises.qs`: no se puede exigir la validación del CIF/NIF sin código ISO. */
const validarExigir = (p: DatosPais) =>
    !p.exigirValidacion || !!p.codiso.trim() ||
    tComun("paises.establezcaElCodigoISO");

const campos = {
    nombre: { requerido: false, maximo: 100 },
    codiso: { requerido: false, maximo: 2, validacion: validarExigir },
    codigoIsoAlpha2: { requerido: false, maximo: 3 },
    codigoIsoAlpha3: { requerido: false, maximo: 3 },
    enUe: { tipo: "checkbox" as const },
    zonaId: { requerido: false, tipo: "selector" as const },
    zonaSepa: { tipo: "checkbox" as const },
    validarProvincias: { tipo: "checkbox" as const },
    exigirValidacion: { tipo: "checkbox" as const, validacion: validarExigir },
    funcionValidacion: { requerido: false },
};

export const metaPais: MetaModelo<Pais> = { campos };

export const metaNuevoPais: MetaModelo<NuevoPais> = {
    campos: { id: { requerido: true, maximo: 20 }, ...campos },
};

const CAMPOS_EDITABLES: (keyof CambiosPais)[] = [
    "nombre", "codiso", "codigoIsoAlpha2", "codigoIsoAlpha3", "enUe", "zonaId",
    "zonaSepa", "validarProvincias", "exigirValidacion", "funcionValidacion",
];

export const cambiosPais = (previo: Pais, actual: Pais): CambiosPais => {
    const cambios: Record<string, unknown> = {};
    for (const campo of CAMPOS_EDITABLES) {
        if (actual[campo] !== previo[campo]) cambios[campo] = actual[campo];
    }
    return cambios as CambiosPais;
};
