import { MetaModelo } from "@olula/lib/dominio.ts";
import { FormaPago, NuevaFormaPago, PlazoFormaPago } from "./diseño.ts";
import { tTesoreria } from "../i18n/index.ts";

/** Longitudes de `formaspago.mtd`. */
export const LONGITUD_CODIGO = 10;
export const LONGITUD_DESCRIPCION = 100;

/** `formaspago.genrecibos`, por defecto "Emitidos". */
export const opcionesGeneraRecibos = [
    { valor: "Emitidos", get descripcion() { return tTesoreria("forma_pago.emitidos"); } },
    { valor: "Pagados", get descripcion() { return tTesoreria("forma_pago.pagados"); } },
];

/** `formaspago.tipopagofacturae` (la primera opción de Eneboo es vacía). */
export const opcionesTipoPagoFacturae = [
    "01 Al contado", "02 Recibo Domiciliado", "03 Recibo", "04 Transferencia",
    "05 Letra Aceptada", "06 Crédito Documentario", "07 Contrato Adjudicación",
    "08 Letra de cambio", "09 Pagaré a la Orden", "10 Pagaré No a la Orden",
    "11 Cheque", "12 Reposición", "13 Especiales", "14 Compensación",
    "15 Giro postal", "16 Cheque conformado", "17 Cheque bancario",
    "18 Pago contra reembolso", "19 Pago mediante tarjeta",
].map((valor) => ({ valor, descripcion: valor }));

export const formaPagoVacia = (): FormaPago => ({
    id: "",
    descripcion: "",
    generaRecibos: "Emitidos",
    cuentaId: "",
    descripcionCuenta: "",
    domiciliado: false,
    tipoPagoFacturae: "",
    plazos: [],
});

export const nuevaFormaPagoVacia = (): NuevaFormaPago => ({
    id: "",
    descripcion: "",
    generaRecibos: "Emitidos",
    cuentaId: "",
    domiciliado: false,
    tipoPagoFacturae: "",
});

export const etiquetaFormaPago = (f: FormaPago): string =>
    f.descripcion ? `${f.id} — ${f.descripcion}` : f.id;

const camposComunes = {
    descripcion: { requerido: false, maximo: LONGITUD_DESCRIPCION },
    generaRecibos: { requerido: true, tipo: "selector" as const },
    cuentaId: { requerido: false, tipo: "selector" as const },
    domiciliado: { tipo: "checkbox" as const },
    tipoPagoFacturae: { requerido: false, tipo: "selector" as const },
};

export const metaFormaPago: MetaModelo<FormaPago> = {
    campos: camposComunes,
};

export const metaNuevaFormaPago: MetaModelo<NuevaFormaPago> = {
    campos: {
        id: { requerido: true, maximo: LONGITUD_CODIGO },
        ...camposComunes,
    },
};

const redondear2 = (n: number) => Math.round(n * 100) / 100;

export const totalAplazado = (plazos: PlazoFormaPago[]): number =>
    redondear2(plazos.reduce((suma, p) => suma + redondear2(Number(p.aplazado) || 0), 0));

/** `plazos.qs`: el nuevo plazo propone lo que falta hasta el 100 %. */
export const nuevoPlazo = (plazos: PlazoFormaPago[]): PlazoFormaPago => ({
    dias: 0,
    aplazado: Math.max(redondear2(100 - totalAplazado(plazos)), 0),
});

/** `plazos.qs` y `formaspago.qs validarAplazados`: cada % mayor que cero,
 * días no negativos y la suma igual a 100. Devuelve el error o null. */
export const errorPlazos = (plazos: PlazoFormaPago[]): string | null => {
    if (plazos.some((p) => !Number.isInteger(Number(p.dias)) || Number(p.dias) < 0)) {
        return tTesoreria("forma_pago.losDiasAplazadosDebenSerUn");
    }
    if (plazos.some((p) => !(redondear2(Number(p.aplazado)) > 0))) {
        return tTesoreria("forma_pago.elAplazadoDebeSerMayorQue");
    }
    if (totalAplazado(plazos) !== 100) {
        return tTesoreria("forma_pago.laSumaDeLosAplazadosDebe");
    }
    return null;
};

export const REGLA_FORMA_PAGO = "comun.forma_pago";
