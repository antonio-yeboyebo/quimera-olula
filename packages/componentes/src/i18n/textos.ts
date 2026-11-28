import { textoSiExiste } from "@olula/lib/i18n/i18n.ts";
import { en } from "./en.ts";
import { es } from "./es.ts";
import { registrarTraducciones } from "@olula/lib/i18n/i18n.ts";

/** Textos de `@olula/componentes` (namespace `componentes`). */
export const { t: tComponentes, useT: useTComponentes } = registrarTraducciones("componentes", { es, en });

/** Nombre de una entrada de menú en el idioma activo (las que no están en `menu` salen tal cual). */
export const nombreMenu = (nombre: string): string =>
    textoSiExiste("componentes", `menu.${nombre}`, nombre);
