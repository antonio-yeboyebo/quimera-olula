import { MetaModelo } from "@olula/lib/dominio.ts";
import {
    CamposPartidaPlantilla,
    NuevaPartidaPlantilla,
    PartidaPlantilla,
    PlantillaAsiento,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

type Opcion = { valor: string; descripcion: string };

/** Las opciones guardan el valor de Eneboo (en español) y enseñan su traducción. */
const TEXTO_OPCION: Record<string, () => string> = {
    Establecer: () => tContabilidad("plantilla_asiento.opEstablecer"),
    Pedir: () => tContabilidad("plantilla_asiento.opPedir"),
    Definida: () => tContabilidad("plantilla_asiento.opDefinida"),
    Definido: () => tContabilidad("plantilla_asiento.opDefinido"),
    Debe: () => tContabilidad("plantilla_asiento.opDebe"),
    Haber: () => tContabilidad("plantilla_asiento.opHaber"),
    Calcular: () => tContabilidad("plantilla_asiento.opCalcular"),
    Cuadrar: () => tContabilidad("plantilla_asiento.opCuadrar"),
    "Último": () => tContabilidad("plantilla_asiento.opUltimo"),
    Recibo: () => tContabilidad("plantilla_asiento.opRecibo"),
    "Factura de cliente": () => tContabilidad("plantilla_asiento.opFacturaCliente"),
    "Factura de proveedor": () => tContabilidad("plantilla_asiento.opFacturaProveedor"),
    "No pedir": () => tContabilidad("plantilla_asiento.opNoPedir"),
    Auto: () => tContabilidad("plantilla_asiento.opAuto"),
};

const opciones = (...valores: string[]): Opcion[] =>
    valores.map((valor) => ({
        valor,
        get descripcion() {
            return TEXTO_OPCION[valor]?.() ?? valor;
        },
    }));

// Listas de opciones de `co_planpartidas.mtd`.
export const OPCIONES_TIPO_SUBCUENTA = opciones("Establecer", "Pedir", "Definida");
export const OPCIONES_DEBE_HABER = opciones("Debe", "Haber");
export const OPCIONES_TIPO_IMPORTE = opciones("Pedir", "Calcular", "Cuadrar");
export const OPCIONES_TIPO_CONCEPTO = opciones("Establecer", "Pedir", "Último", "Definido");
export const OPCIONES_TIPO_DOCUMENTO = opciones("Establecer", "Pedir", "Último");
export const OPCIONES_TIPO_DOCUMENTO_ORIGEN = opciones(
    "Recibo",
    "Factura de cliente",
    "Factura de proveedor"
);
export const OPCIONES_TIPO_FACTURA = opciones("Pedir", "No pedir", "Auto");
export const OPCIONES_TIPO_BASE_IMPONIBLE = opciones("Pedir", "Calcular");

/** Valores por defecto de Eneboo (`co_planpartidas.mtd` y el formulario). */
export const nuevaPartidaPlantillaVacia = (): NuevaPartidaPlantilla => ({
    numeroOrden: 0,
    tipoSubcuenta: "Pedir",
    codigoSubcuenta: "",
    variableSubcuenta: "",
    debeHaber: "Debe",
    saltarSiCero: false,
    tipoImporte: "Pedir",
    importe: "",
    variableImporte: "",
    tipoConcepto: "Establecer",
    concepto: "",
    variableConcepto: "",
    tipoDocumento: "Establecer",
    documento: "",
    tipoDocumentoOrigen: "Recibo",
    tipoFactura: "No pedir",
    serieId: "",
    tipoBaseImponible: "Calcular",
    baseImponible: "",
    variableBaseImponible: "",
    tipoContrapartida: "Establecer",
    codigoContrapartida: "",
    variableContrapartida: "",
});

const MAX_VARIABLE = 6;

const validarVariable = (campo: keyof CamposPartidaPlantilla) =>
    (modelo: CamposPartidaPlantilla) => {
        const valor = String(modelo[campo] ?? "");
        return valor.length > MAX_VARIABLE
            ? tContabilidad("plantilla_asiento.maximoMaxVariableCaracteres", { MAX_VARIABLE })
            : true;
    };

const parentesisEquilibrados = (formula: string): boolean => {
    let abiertos = 0;
    for (const c of formula) {
        if (c === "(") abiertos++;
        if (c === ")") abiertos--;
        if (abiertos < 0) return false;
    }
    return abiertos === 0;
};

const validarFormula = (campo: keyof CamposPartidaPlantilla) =>
    (modelo: CamposPartidaPlantilla) =>
        parentesisEquilibrados(String(modelo[campo] ?? ""))
            ? true
            : tContabilidad("plantilla_asiento.reviseLosParentesisDeLaFormula");

export const metaPartidaPlantilla: MetaModelo<CamposPartidaPlantilla> = {
    campos: {
        numeroOrden: { tipo: "entero" },
        tipoSubcuenta: { requerido: true },
        codigoSubcuenta: {
            requerido: (m) => m.tipoSubcuenta === "Establecer",
            maximo: 15,
        },
        variableSubcuenta: {
            requerido: (m) => m.tipoSubcuenta === "Definida",
            validacion: validarVariable("variableSubcuenta"),
        },
        debeHaber: { requerido: true },
        saltarSiCero: { tipo: "checkbox" },
        tipoImporte: { requerido: true },
        importe: {
            requerido: (m) => m.tipoImporte === "Calcular",
            validacion: validarFormula("importe"),
        },
        variableImporte: { validacion: validarVariable("variableImporte") },
        tipoConcepto: { requerido: true },
        variableConcepto: {
            requerido: (m) => m.tipoConcepto === "Definido",
            validacion: validarVariable("variableConcepto"),
        },
        tipoDocumento: { requerido: true },
        documento: { maximo: 30 },
        tipoFactura: { requerido: true },
        serieId: { maximo: 2 },
        tipoBaseImponible: { requerido: true },
        baseImponible: { validacion: validarFormula("baseImponible") },
        variableBaseImponible: { validacion: validarVariable("variableBaseImponible") },
        tipoContrapartida: { requerido: true },
        codigoContrapartida: { maximo: 15 },
        variableContrapartida: {
            requerido: (m) => m.tipoContrapartida === "Definida",
            validacion: validarVariable("variableContrapartida"),
        },
    },
};

/** Descripción corta de la partida para el listado. */
export const resumenSubcuenta = (p: CamposPartidaPlantilla): string => {
    if (p.tipoSubcuenta === "Definida") return `= ${p.variableSubcuenta}`;
    const codigo = p.codigoSubcuenta || "…";
    return p.tipoSubcuenta === "Pedir" ? tContabilidad("plantilla_asiento.codigoPedir", { codigo }) : codigo;
};

export const resumenImporte = (p: CamposPartidaPlantilla): string => {
    const variable = p.variableImporte ? ` → ${p.variableImporte}` : "";
    if (p.tipoImporte === "Calcular") return `= ${p.importe}${variable}`;
    if (p.tipoImporte === "Cuadrar") return tContabilidad("plantilla_asiento.cuadrar");
    return tContabilidad("plantilla_asiento.pedirVariable", { variable });
};

export const resumenConcepto = (p: CamposPartidaPlantilla): string => {
    switch (p.tipoConcepto) {
        case "Último":
            return tContabilidad("plantilla_asiento.elAnterior");
        case "Definido":
            return `= ${p.variableConcepto}`;
        case "Pedir":
            return tContabilidad("plantilla_asiento.conceptoPedir", { concepto: p.concepto }).trim();
        default:
            return p.concepto;
    }
};

export const etiquetaPlantilla = (p: { id: string; descripcion: string }): string =>
    p.descripcion ? `${p.id} · ${p.descripcion}` : p.id;

/** Qué pide una partida al generar el asiento (Eneboo `establecerPaso`). La
 * base imponible y la factura solo se usan si la subcuenta es de IVA. */
export interface CamposPedidos {
    subcuenta: boolean;
    importe: boolean;
    concepto: boolean;
    documento: boolean;
    contrapartida: boolean;
    baseImponible: boolean;
    numeroFactura: boolean;
}

export const camposPedidos = (p: CamposPartidaPlantilla): CamposPedidos => ({
    subcuenta: p.tipoSubcuenta === "Pedir",
    importe: p.tipoImporte === "Pedir",
    concepto: p.tipoConcepto === "Pedir",
    documento: p.tipoDocumento === "Pedir",
    contrapartida: p.tipoContrapartida === "Pedir",
    baseImponible: p.tipoBaseImponible === "Pedir",
    numeroFactura: p.tipoFactura === "Pedir",
});

export const pideAlgo = (p: CamposPartidaPlantilla): boolean =>
    Object.values(camposPedidos(p)).some(Boolean);

export const partidasOrdenadas = (plantilla: PlantillaAsiento): PartidaPlantilla[] =>
    [...plantilla.partidas].sort((a, b) => a.numeroOrden - b.numeroOrden);

export const plantillaAsientoVacia = (): PlantillaAsiento => ({
    id: "",
    descripcion: "",
    concatenar: "",
    partidas: [],
});

export const totalesCalculo = (
    partidas: { debe: number; haber: number; omitida: boolean }[]
): { debe: number; haber: number } =>
    partidas
        .filter((p) => !p.omitida)
        .reduce(
            (total, p) => ({ debe: total.debe + p.debe, haber: total.haber + p.haber }),
            { debe: 0, haber: 0 }
        );
