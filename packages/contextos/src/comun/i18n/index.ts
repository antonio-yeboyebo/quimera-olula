import { registrarTraducciones } from "@olula/lib/i18n/i18n.ts";
import { en } from "./en.ts";
import { es } from "./es.ts";

/** Textos de los componentes comunes de los contextos (namespace `comun`). */
export const { t: tComun, useT: useTComun } = registrarTraducciones("comun", { es, en });
