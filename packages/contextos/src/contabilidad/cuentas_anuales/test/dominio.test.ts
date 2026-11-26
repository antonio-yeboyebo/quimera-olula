import { describe, expect, test } from "vitest";
import { LineaCuentasAnuales, SubtotalCuentasAnuales } from "../diseño.ts";
import { metaCuentasAnuales } from "../detalle/detalle.ts";
import {
    admiteDesglose,
    admiteOmitirEpigrafes,
    conceptoLinea,
    cuentasAnualesVacias,
    desgloseSegunFormato,
    etiquetaCuentasAnuales,
    nivelLinea,
    nombreFicheroCuentasAnuales,
    nuevaCuentasAnualesInicial,
    omitirEpigrafesSegunTipo,
    subtotalesTrasLinea,
} from "../dominio.ts";

const linea = (campos: Partial<LineaCuentasAnuales>): LineaCuentasAnuales => ({
    codbalance: "PG-A-1-a-",
    naturaleza: "PG",
    nivel1: "A",
    nivel2: 1,
    descripcion1: "A) OPERACIONES CONTINUADAS",
    descripcion2: "1. Importe neto de la cifra de negocios.",
    descripcion3: "a) Ventas",
    descripcion4: "",
    saldoActual: 0,
    saldoAnterior: 0,
    desglose: [],
    ...campos,
});

const subtotal = (
    codigo: string,
    despuesDeNivel2: number
): SubtotalCuentasAnuales => ({
    codigo,
    descripcion: `${codigo}) Bloque`,
    saldoActual: 0,
    saldoAnterior: 0,
    despuesDeNivel2,
});

describe("opciones del informe", () => {
    test("el formato abreviado no admite desglose", () => {
        expect(admiteDesglose("Normal")).toBe(true);
        expect(admiteDesglose("Abreviado")).toBe(false);
    });

    test("el abreviado fuerza No desglosar", () => {
        expect(desgloseSegunFormato("Abreviado", "Subcuenta")).toBe(
            "No desglosar"
        );
        expect(desgloseSegunFormato("Normal", "Subcuenta")).toBe("Subcuenta");
    });

    test("omitir epígrafes sin saldo solo existe en situación", () => {
        expect(admiteOmitirEpigrafes("Situacion")).toBe(true);
        expect(admiteOmitirEpigrafes("Perdidas y ganancias")).toBe(false);
        expect(admiteOmitirEpigrafes("Ingresos y gastos")).toBe(false);
    });

    test("el informe nuevo abarca el ejercicio completo", () => {
        const nuevo = nuevaCuentasAnualesInicial("2026");

        expect(nuevo.fechaDesde).toBe("2026-01-01");
        expect(nuevo.fechaHasta).toBe("2026-12-31");
        expect(nuevo.ejercicioAnteriorId).toBe("");
    });
});

describe("presentación de líneas", () => {
    test("el importe cuelga del último nivel informado", () => {
        expect(nivelLinea(linea({}))).toBe(2);
        expect(nivelLinea(linea({ descripcion4: "1. Desarrollo." }))).toBe(3);
        expect(
            nivelLinea(
                linea({ descripcion2: "", descripcion3: "", descripcion4: "" })
            )
        ).toBe(0);
    });

    test("el concepto es el texto de ese nivel", () => {
        expect(conceptoLinea(linea({}))).toBe("a) Ventas");
        expect(conceptoLinea(linea({ descripcion4: "1. Desarrollo." }))).toBe(
            "1. Desarrollo."
        );
    });

    test("sin ningún texto se cae al código de balance", () => {
        const sinTextos = linea({
            descripcion1: "",
            descripcion2: "",
            descripcion3: "",
            descripcion4: "",
        });

        expect(conceptoLinea(sinTextos)).toBe("PG-A-1-a-");
    });
});

describe("colocación de los subtotales", () => {
    const subtotales = [subtotal("A.1", 1), subtotal("A.4", 20)];

    test("salen tras la última línea de su epígrafe", () => {
        const actual = linea({ nivel2: 1 });
        const siguiente = linea({ nivel2: 20 });

        expect(
            subtotalesTrasLinea(subtotales, actual, siguiente).map(
                (s) => s.codigo
            )
        ).toEqual(["A.1"]);
    });

    test("no salen si el epígrafe continúa en la línea siguiente", () => {
        const actual = linea({ nivel2: 1 });
        const siguiente = linea({ nivel2: 1 });

        expect(subtotalesTrasLinea(subtotales, actual, siguiente)).toEqual([]);
    });

    test("la última línea del informe cierra su epígrafe", () => {
        const actual = linea({ nivel2: 20 });

        expect(
            subtotalesTrasLinea(subtotales, actual, undefined).map(
                (s) => s.codigo
            )
        ).toEqual(["A.4"]);
    });

    test("las líneas sin epígrafe no llevan subtotal", () => {
        const actual = linea({ nivel2: null });

        expect(subtotalesTrasLinea(subtotales, actual, undefined)).toEqual([]);
    });
});

describe("nombres", () => {
    test("la etiqueta combina descripción y tipo", () => {
        expect(
            etiquetaCuentasAnuales({
                descripcion: "Cierre 2026",
                tipo: "Situacion",
            })
        ).toBe("Cierre 2026 — Situación");
    });

    test("sin descripción se queda el tipo", () => {
        expect(
            etiquetaCuentasAnuales({ descripcion: "", tipo: "Situacion" })
        ).toBe("Situación");
    });

    test("el fichero descargado se nombra a partir de la descripción", () => {
        const informe = { descripcion: "Balance Situación 2026", tipo: "Situacion" as const };

        expect(nombreFicheroCuentasAnuales(informe, "pdf")).toBe(
            "balance-situacion-2026.pdf"
        );
        expect(nombreFicheroCuentasAnuales(informe, "xlsx")).toBe(
            "balance-situacion-2026.xlsx"
        );
    });
});

describe("omitir epígrafes sin saldo", () => {
    test("se edita como casilla en la ficha", () => {
        expect(metaCuentasAnuales.campos?.omitirEpigrafesSinSaldo?.tipo).toBe(
            "checkbox"
        );
    });

    test("al marcarla queda como booleano", () => {
        const resultado = metaCuentasAnuales.onChange?.(
            {
                ...cuentasAnualesVacias(),
                tipo: "Situacion",
                omitirEpigrafesSinSaldo: "true" as unknown as boolean,
            },
            "omitirEpigrafesSinSaldo",
            false
        );
        expect(resultado?.omitirEpigrafesSinSaldo).toBe(true);
    });

    test("fuera del balance de situación se apaga (habilitarPorTipo)", () => {
        const informe = {
            ...cuentasAnualesVacias(),
            tipo: "Perdidas y ganancias" as const,
            omitirEpigrafesSinSaldo: true,
        };
        expect(omitirEpigrafesSegunTipo(informe).omitirEpigrafesSinSaldo).toBe(
            false
        );
        const situacion = { ...informe, tipo: "Situacion" as const };
        expect(omitirEpigrafesSegunTipo(situacion)).toBe(situacion);
    });
});
