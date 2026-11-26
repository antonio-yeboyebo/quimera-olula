import { tContabilidad } from "../i18n/index.ts";
/**
 * Pestañas de la pantalla del Plan General Contable, en el orden en que se
 * muestran. La clave permite abrir la pantalla directamente en una pestaña
 * (p. ej. la ruta antigua `/contabilidad/codigo_balance`).
 */
export const pestanasPgc = [
    { clave: "subcuentas", get titulo() { return tContabilidad("pgc.subcuentas"); } },
    { clave: "cuentas", get titulo() { return tContabilidad("pgc.cuentas"); } },
    { clave: "cuentas_especiales", get titulo() { return tContabilidad("pgc.cuentasEspeciales"); } },
    { clave: "subgrupos", get titulo() { return tContabilidad("pgc.subgrupos"); } },
    { clave: "grupos", get titulo() { return tContabilidad("pgc.grupos"); } },
    { clave: "codigos_balance", get titulo() { return tContabilidad("pgc.codigosDeBalance2008"); } },
] as const;

export type PestanaPgc = (typeof pestanasPgc)[number]["clave"];

/** Índice de la pestaña con esa clave; la primera si no se indica o no existe. */
export const indicePestanaPgc = (clave?: string): number =>
    Math.max(0, pestanasPgc.findIndex((p) => p.clave === clave));

export const tituloPestanaPgc = (clave: PestanaPgc): string =>
    pestanasPgc[indicePestanaPgc(clave)].titulo;
