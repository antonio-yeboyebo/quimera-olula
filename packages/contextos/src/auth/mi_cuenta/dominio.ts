import { Idioma } from "./diseño.ts";

export const idiomaPorDefecto: Idioma = "es";

export const opcionesIdioma: { valor: Idioma; descripcion: string }[] = [
    { valor: "es", descripcion: "Español" },
    { valor: "en", descripcion: "Inglés" },
];

/** El idioma de un valor cualquiera (del servidor o del combo): lo que no se conoce es español. */
export const idiomaDesde = (valor: unknown): Idioma =>
    opcionesIdioma.find((opcion) => opcion.valor === valor)?.valor ?? idiomaPorDefecto;
