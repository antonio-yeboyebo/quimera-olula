import { en } from "./en.ts";
import { es } from "./es.ts";
import { registrarTraducciones } from "./i18n.ts";

/** Textos propios de `@olula/lib` (namespace `lib`). */
export const { t: tLib, useT: useTLib } = registrarTraducciones("lib", { es, en });
