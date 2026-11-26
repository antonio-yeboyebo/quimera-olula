import { registrarTraducciones } from "@olula/lib/i18n/i18n.ts";
import { en } from "./en.ts";
import { es } from "./es.ts";

/** Textos del contexto Auth (namespace `auth`). */
export const { t: tAuth, useT: useTAuth } = registrarTraducciones("auth", { es, en });
