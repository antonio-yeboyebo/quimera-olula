import { tComponentes } from "../i18n/textos.ts";
/**
 * URL de la ficha a partir de una plantilla: `{id}` se sustituye por el valor (codificado); sin
 * `{id}`, el valor se añade como último tramo de la ruta. Null sin plantilla o sin valor.
 */
export const urlEnlace = (enlace: string | null | undefined, valor: string | null | undefined): string | null => {
  if (!enlace || !valor) return null;
  return enlace.includes("{id}")
    ? enlace.replace("{id}", encodeURIComponent(valor))
    : `${enlace.replace(/\/$/, "")}/${valor}`;
};

/** «Abrir artículo 90197»: la cabecera en minúscula y el valor, si es texto. */
export const etiquetaEnlace = (titulo: string, valor: unknown): string =>
  tComponentes("ui.atomos.abrirTolowercaseValor", { toLowerCase: titulo.toLowerCase(), valor: typeof valor === "string" || typeof valor === "number" ? ` ${valor}` : "" });
