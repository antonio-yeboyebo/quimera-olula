import { IDIOMA_DEFECTO, IDIOMAS, idiomaDesde as idiomaDesdeLib } from "@olula/lib/i18n/i18n.ts";
import { tAuth } from "../i18n/index.ts";
import { Idioma } from "./diseño.ts";

export const idiomaPorDefecto: Idioma = IDIOMA_DEFECTO;

/** Opciones del combo de idioma, con sus nombres en el idioma activo. */
export const opcionesIdioma = (): { valor: Idioma; descripcion: string }[] =>
    IDIOMAS.map((valor) => ({ valor, descripcion: tAuth(`miCuenta.idiomas.${valor}`) }));

/** El idioma de un valor cualquiera (del servidor o del combo): lo que no se conoce es español. */
export const idiomaDesde = (valor: unknown): Idioma => idiomaDesdeLib(valor);
