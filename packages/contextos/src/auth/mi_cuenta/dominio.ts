import { IDIOMA_DEFECTO, idiomaDesde as idiomaDesdeLib } from "@olula/lib/i18n/i18n.ts";
import { Idioma } from "./diseño.ts";

export const idiomaPorDefecto: Idioma = IDIOMA_DEFECTO;

export const opcionesIdioma: { valor: Idioma; descripcion: string }[] = [
    { valor: "es", descripcion: "Español" },
    { valor: "en", descripcion: "Inglés" },
];

/** El idioma de un valor cualquiera (del servidor o del combo): lo que no se conoce es español. */
export const idiomaDesde = (valor: unknown): Idioma => idiomaDesdeLib(valor);
