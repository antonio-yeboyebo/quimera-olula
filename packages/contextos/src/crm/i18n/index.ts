import { registrarTraducciones } from "@olula/lib/i18n/i18n.ts";
import { en } from "./en.ts";
import { es } from "./es.ts";

/** Textos del contexto CRM (namespace `crm`). */
export const { t: tCrm, useT: useTCrm } = registrarTraducciones("crm", { es, en });
