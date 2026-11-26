import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { PartidaSubcuenta } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

/** Columnas de co_partidasmayor en Eneboo. */
export const metaTablaPartidasSubcuenta: MetaTabla<PartidaSubcuenta> = [
    { id: "fecha", get cabecera() { return tContabilidad("subcuentas_tercero.fecha"); }, tipo: "fecha" },
    { id: "numeroAsiento", get cabecera() { return tContabilidad("subcuentas_tercero.asiento"); }, tipo: "numero" },
    { id: "concepto", get cabecera() { return tContabilidad("subcuentas_tercero.concepto"); } },
    { id: "debe", get cabecera() { return tContabilidad("subcuentas_tercero.debe"); }, tipo: "moneda" },
    { id: "haber", get cabecera() { return tContabilidad("subcuentas_tercero.haber"); }, tipo: "moneda" },
    { id: "saldo", get cabecera() { return tContabilidad("subcuentas_tercero.saldo"); }, tipo: "moneda" },
];
