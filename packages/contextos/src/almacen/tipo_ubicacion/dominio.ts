import { MetaModelo } from "@olula/lib/dominio.ts";
import { FormatoUbicacion, NuevoTipoUbicacion, TipoUbicacion } from "./diseño.ts";
import { sinTexto } from "#/almacen/comun/dominio.ts";
import { tAlmacen } from "../i18n/index.ts";

export const formatosUbicacion: { valor: FormatoUbicacion; descripcion: string }[] = [
    { valor: "HUECO_PALET", get descripcion() { return tAlmacen("tipo_ubicacion.huecoDePale"); } },
    { valor: "ESTANTE", get descripcion() { return tAlmacen("tipo_ubicacion.estante"); } },
    { valor: "SUELO", get descripcion() { return tAlmacen("tipo_ubicacion.suelo"); } },
    { valor: "PLAYA", get descripcion() { return tAlmacen("tipo_ubicacion.playa"); } },
];

export const descripcionFormatoUbicacion = (formato: string): string =>
    formatosUbicacion.find((f) => f.valor === formato)?.descripcion ?? formato;

/** Un valor opcional es válido si falta o es un número finito >= 0. */
export const numeroNoNegativoONulo = (valor: number | null | undefined): boolean =>
    valor === null || valor === undefined || (Number.isFinite(valor) && valor >= 0);

/** Un valor opcional es válido si falta o es un entero >= 0. */
export const enteroNoNegativoONulo = (valor: number | null | undefined): boolean =>
    numeroNoNegativoONulo(valor) && (valor === null || valor === undefined || Number.isInteger(valor));

type CamposTipoUbicacion = Pick<
    NuevoTipoUbicacion,
    "codigo" | "descripcion" | "formato" | "capacidadPalets" | "pesoMax" | "alturaMax"
>;

/** Devuelve `true` si es válido o el mensaje del primer error. */
export const validarTipoUbicacion = (m: CamposTipoUbicacion): string | true => {
    if (sinTexto(m.codigo)) return tAlmacen("tipo_ubicacion.elCodigoEsObligatorio");
    if (m.codigo.length > 10) return tAlmacen("tipo_ubicacion.elCodigoAdmiteComoMaximo10");
    if (sinTexto(m.descripcion)) return tAlmacen("tipo_ubicacion.laDescripcionEsObligatoria");
    if (sinTexto(m.formato)) return tAlmacen("tipo_ubicacion.elFormatoEsObligatorio");
    if (!enteroNoNegativoONulo(m.capacidadPalets)) return tAlmacen("tipo_ubicacion.laCapacidadDePalesDebeSer");
    if (!numeroNoNegativoONulo(m.pesoMax)) return tAlmacen("tipo_ubicacion.elPesoMaximoDebeSerMayor");
    if (!numeroNoNegativoONulo(m.alturaMax)) return tAlmacen("tipo_ubicacion.laAlturaMaximaDebeSerMayor");
    return true;
};

const camposTipoUbicacion = {
    codigo: { requerido: true },
    descripcion: { requerido: true },
    formato: { requerido: true },
    capacidadPalets: { requerido: false, tipo: "entero" as const },
    pesoMax: { requerido: false, tipo: "decimal" as const },
    alturaMax: { requerido: false, tipo: "decimal" as const },
    multiReferencia: { tipo: "checkbox" as const },
    multiLote: { tipo: "checkbox" as const },
};

export const tipoUbicacionVacio = (): TipoUbicacion => ({
    id: "",
    codigo: "",
    descripcion: "",
    formato: "HUECO_PALET",
    capacidadPalets: null,
    pesoMax: null,
    alturaMax: null,
    multiReferencia: false,
    multiLote: true,
});

/** Constante estable (no función) para el formulario de alta. */
export const nuevoTipoUbicacionVacio: NuevoTipoUbicacion = {
    codigo: "",
    descripcion: "",
    formato: "HUECO_PALET",
    capacidadPalets: null,
    pesoMax: null,
    alturaMax: null,
    multiReferencia: false,
    multiLote: true,
};

export const metaTipoUbicacion: MetaModelo<TipoUbicacion> = {
    campos: camposTipoUbicacion,
    validacion: validarTipoUbicacion,
};

export const metaNuevoTipoUbicacion: MetaModelo<NuevoTipoUbicacion> = {
    campos: camposTipoUbicacion,
    validacion: validarTipoUbicacion,
};
