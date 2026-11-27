import { registrarTraducciones } from "@olula/lib/i18n/i18n.ts";
import { en } from "./en.ts";
import { es } from "./es.ts";

/** Textos del contexto Tesorería (namespace `tesoreria`). */
export const { t: tTesoreria, useT: useTTesoreria } = registrarTraducciones("tesoreria", { es, en });
