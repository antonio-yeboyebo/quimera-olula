import { sinTexto } from "#/almacen/comun/dominio.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { Magnitud, NuevoPesoMedida, PesoMedida } from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

type CamposPesoMedida = Pick<NuevoPesoMedida, "id" | "descripcion" | "factorConversion">;

/** Devuelve `true` si es válido o el mensaje del primer error (longitudes de pesosmedidas.mtd). */
export const validarPesoMedida = (m: CamposPesoMedida): string | true => {
    if (sinTexto(m.id)) return tAlmacen("peso_medida.laAbreviaturaEsObligatoria");
    if (m.id.trim().length > 10) return tAlmacen("peso_medida.laAbreviaturaAdmiteComoMaximo10");
    if (sinTexto(m.descripcion)) return tAlmacen("peso_medida.laDescripcionEsObligatoria");
    if (m.descripcion.length > 100) return tAlmacen("peso_medida.laDescripcionAdmiteComoMaximo100");
    const factor = Number(m.factorConversion);
    if (!Number.isFinite(factor) || factor < 0) return tAlmacen("peso_medida.elFactorDeConversionNoPuede");
    return true;
};

const camposPesoMedida = {
    id: { requerido: true },
    descripcion: { requerido: true },
    magnitud: { requerido: false },
    factorConversion: { requerido: false, tipo: "numero" as const },
};

export const pesoMedidaVacio = (): PesoMedida => ({
    id: "",
    descripcion: "",
    magnitud: "Unidades",
    factorConversion: 0,
});

/** Constante estable (no función) para el formulario de alta. */
export const nuevoPesoMedidaVacio: NuevoPesoMedida = {
    id: "",
    descripcion: "",
    magnitud: "Unidades",
    factorConversion: 0,
};

export const metaPesoMedida: MetaModelo<PesoMedida> = {
    campos: camposPesoMedida,
    validacion: validarPesoMedida,
};

export const metaNuevoPesoMedida: MetaModelo<NuevoPesoMedida> = {
    campos: camposPesoMedida,
    validacion: validarPesoMedida,
};

/** La magnitud se guarda en español (valor de Eneboo); se enseña traducida. */
const TEXTO_MAGNITUD: Record<Magnitud, () => string> = {
    Unidades: () => tAlmacen("peso_medida.magnitudUnidades"),
    Longitud: () => tAlmacen("peso_medida.magnitudLongitud"),
    Superficie: () => tAlmacen("peso_medida.magnitudSuperficie"),
    Volumen: () => tAlmacen("peso_medida.magnitudVolumen"),
    Peso: () => tAlmacen("peso_medida.magnitudPeso"),
    Tiempo: () => tAlmacen("peso_medida.magnitudTiempo"),
    Otro: () => tAlmacen("peso_medida.magnitudOtro"),
};

export const descripcionMagnitud = (m: string): string => TEXTO_MAGNITUD[m as Magnitud]?.() ?? m;
