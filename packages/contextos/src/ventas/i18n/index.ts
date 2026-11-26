import { registrarTraducciones } from "@olula/lib/i18n/i18n.ts";
import { en } from "./en.ts";
import { es } from "./es.ts";

/** Textos del contexto Ventas (namespace `ventas`). */
export const { t: tVentas, useT: useTVentas } = registrarTraducciones("ventas", { es, en });
