import { registrarTraducciones } from "@olula/lib/i18n/i18n.ts";
import { en } from "./en.ts";
import { es } from "./es.ts";

/** Textos del contexto Almacén (namespace `almacen`). */
export const { t: tAlmacen, useT: useTAlmacen } = registrarTraducciones("almacen", { es, en });
