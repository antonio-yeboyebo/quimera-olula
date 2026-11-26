import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { PartidaCompra } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

export const metaTablaPartidasCompra: MetaTabla<PartidaCompra> = [
    { id: "fecha", get cabecera() { return tContabilidad("amortizacion.fecha"); }, tipo: "fecha" },
    { id: "codigoFactura", get cabecera() { return tContabilidad("amortizacion.factura"); } },
    { id: "nombreProveedor", get cabecera() { return tContabilidad("amortizacion.proveedor"); } },
    { id: "codigoSubcuenta", get cabecera() { return tContabilidad("amortizacion.subcuenta"); } },
    { id: "concepto", get cabecera() { return tContabilidad("amortizacion.concepto"); } },
    { id: "debe", get cabecera() { return tContabilidad("amortizacion.debe"); }, tipo: "moneda" },
];
