import i18next, { type i18n as InstanciaI18n } from "i18next";
import { useMemo } from "react";
import { initReactI18next, useTranslation } from "react-i18next";

/**
 * Traducción de la interfaz (i18next + react-i18next).
 *
 * - El idioma es el de «Mi cuenta» del usuario (`usuarios.idioma`); sin idioma, español.
 *   Se guarda también en localStorage para arrancar ya en ese idioma antes de que
 *   responda el servidor.
 * - Cada contexto (y `@olula/componentes`) registra sus textos en su propio
 *   *namespace* con `registrarTraducciones`, que devuelve un `t` tipado con las claves
 *   del fichero español y un hook `useT` que repinta el componente al cambiar el idioma.
 * - El español es la referencia: lo que falte en otro idioma sale en español.
 */

export type Idioma = "es" | "en";

export const IDIOMAS: readonly Idioma[] = ["es", "en"];
export const IDIOMA_DEFECTO: Idioma = "es";

const CLAVE_ALMACEN = "olula.idioma";

/** Locale de `Intl` para cada idioma (números, fechas). */
const LOCALES: Record<Idioma, string> = { es: "es-ES", en: "en-GB" };

/** El idioma de un valor cualquiera (servidor, localStorage, combo): lo desconocido es español. */
export const idiomaDesde = (valor: unknown): Idioma =>
    IDIOMAS.find((idioma) => idioma === valor) ?? IDIOMA_DEFECTO;

const leerIdiomaGuardado = (): Idioma => {
    try {
        return idiomaDesde(localStorage.getItem(CLAVE_ALMACEN));
    } catch {
        return IDIOMA_DEFECTO;
    }
};

const guardarIdioma = (idioma: Idioma) => {
    try {
        localStorage.setItem(CLAVE_ALMACEN, idioma);
    } catch {
        // Sin almacenamiento (modo privado, bloqueado): el idioma vendrá del servidor.
    }
};

const marcarDocumento = (idioma: Idioma) => {
    if (typeof document !== "undefined") document.documentElement.lang = idioma;
};

/** Instancia propia (no la global de i18next) para no chocar con `legacy/`. */
export const i18n: InstanciaI18n = i18next.createInstance();

i18n.use(initReactI18next).init({
    lng: leerIdiomaGuardado(),
    fallbackLng: IDIOMA_DEFECTO,
    supportedLngs: [...IDIOMAS],
    resources: {},
    // Los recursos se registran en memoria: la inicialización es síncrona.
    initAsync: false,
    // Las claves son identificadores (`cliente.maestro.titulo`); los textos pueden llevar ':'.
    nsSeparator: false,
    // React ya escapa lo que pinta.
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
});

marcarDocumento(idiomaDesde(i18n.language));

export const idiomaActual = (): Idioma => idiomaDesde(i18n.language);

export const localeActual = (): string => LOCALES[idiomaActual()];

/** Cambia el idioma de toda la interfaz en caliente (sin recargar) y lo recuerda. */
export const cambiarIdioma = async (idioma: Idioma): Promise<void> => {
    guardarIdioma(idioma);
    marcarDocumento(idioma);
    if (idiomaActual() !== idioma || i18n.language !== idioma) {
        await i18n.changeLanguage(idioma);
    }
};

/** Hook con el idioma actual: el componente se repinta al cambiarlo. */
export const useIdioma = (): Idioma => {
    const { i18n: instancia } = useTranslation(undefined, { i18n });
    return idiomaDesde(instancia.language);
};

// ---------------------------------------------------------------------------
// Tipos de los ficheros de traducción
// ---------------------------------------------------------------------------

/** Árbol de textos de un namespace: hojas string, ramas objeto. */
export type Textos = { readonly [clave: string]: string | Textos };

/** La misma forma que el español, con cualquier texto: así el compilador avisa si falta una clave. */
export type Traduccion<R> = { -readonly [K in keyof R]: R[K] extends string ? string : Traduccion<R[K]> };

type SufijoPlural = "zero" | "one" | "two" | "few" | "many" | "other";

/** `x_one`/`x_other` se piden como `x` con `count` (plurales de i18next). */
type SinPlural<K extends string> = K extends `${infer Base}_${SufijoPlural}` ? Base : K;

/** Claves (con puntos) de las hojas de un árbol de textos. */
export type Claves<R, P extends string = ""> = {
    [K in keyof R & string]: R[K] extends string ? `${P}${SinPlural<K>}` : Claves<R[K], `${P}${K}.`>;
}[keyof R & string];

/** Valores para las plantillas `{{nombre}}` (y `count` para plurales). */
export type ParametrosTexto = Record<string, string | number | null | undefined>;

export type FuncionT<R> = (clave: Claves<R>, parametros?: ParametrosTexto) => string;

type TraducirCualquiera = (clave: string, opciones?: Record<string, unknown>) => string;

const traductor = (ns: string, lng?: string) => {
    const t = i18n.t as unknown as TraducirCualquiera;
    return (clave: string, parametros?: ParametrosTexto) =>
        t(clave, { ns, ...(lng ? { lng } : {}), ...(parametros ?? {}) });
};

export interface Traducciones<R> {
    ns: string;
    /** Traduce al idioma activo. Úsalo fuera de React (dominio, validaciones, infraestructura). */
    t: FuncionT<R>;
    /** Hook: el `t` del idioma activo y repinta el componente al cambiar de idioma. */
    useT: () => FuncionT<R>;
}

/**
 * Registra los textos de un namespace (`es` es la referencia, `en` ha de tener las mismas claves)
 * y devuelve sus funciones de traducción. Se llama una vez, a nivel de módulo, en el `i18n/index.ts`
 * de cada contexto: importar ese módulo basta para que sus textos estén disponibles.
 */
export const registrarTraducciones = <R extends Textos>(
    ns: string,
    recursos: { es: R } & Record<Exclude<Idioma, "es">, Traduccion<R>>,
): Traducciones<R> => {
    for (const idioma of IDIOMAS) {
        i18n.addResourceBundle(idioma, ns, recursos[idioma], true, true);
    }

    const t = traductor(ns) as FuncionT<R>;

    const useT = (): FuncionT<R> => {
        const { i18n: instancia } = useTranslation(ns, { i18n });
        const idioma = instancia.language;
        return useMemo(() => traductor(ns, idioma) as FuncionT<R>, [idioma]);
    };

    return { ns, t, useT };
};
