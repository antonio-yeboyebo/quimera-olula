import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { PERIODOS, textoEstadoAmortizacion } from "../amortizacion/dominio.ts";
import { metaNuevoAsientoManual } from "../asiento/dominio.ts";
import { metaTablaAsiento } from "../asiento/vistas/maestro/diseño.ts";
import { RenumerarAsientos } from "../asiento/vistas/renumerar/RenumerarAsientos.tsx";
import { etiquetaCuentasAnuales } from "../cuentas_anuales/dominio.ts";
import { textoEstadoEjercicio } from "../ejercicio/dominio.ts";
import { textoCabeceraLibroDiario } from "../libro_diario/dominio.ts";
import { OPCIONES_TIPO_DOCUMENTO_ORIGEN } from "../plantilla_asiento/dominio.ts";

afterEach(async () => {
    await act(() => cambiarIdioma("es"));
    localStorage.clear();
});

describe("Contabilidad en español e inglés", () => {
    test("las columnas del maestro se traducen al leerlas, sin rehacer la tabla", async () => {
        expect(metaTablaAsiento.map((c) => c.cabecera)).toEqual(["Nº", "Fecha", "Concepto", "Importe", "Manual"]);
        await cambiarIdioma("en");
        expect(metaTablaAsiento.map((c) => c.cabecera)).toEqual(["No.", "Date", "Description", "Amount", "Manual"]);
    });

    test("opciones: se traduce lo que se ve, el valor guardado no cambia", async () => {
        await cambiarIdioma("en");
        expect(PERIODOS[1]).toEqual({ valor: "Trimestral", descripcion: "Quarterly" });
        expect(OPCIONES_TIPO_DOCUMENTO_ORIGEN[1]).toEqual({
            valor: "Factura de cliente",
            descripcion: "Customer invoice",
        });
    });

    test("valores de la BD que se enseñan traducidos", async () => {
        expect(textoEstadoEjercicio("ABIERTO")).toBe("Abierto");
        expect(textoEstadoAmortizacion("En Curso")).toBe("En Curso");
        await cambiarIdioma("en");
        expect(textoEstadoEjercicio("CERRADO")).toBe("Closed");
        expect(textoEstadoAmortizacion("En Curso")).toBe("In progress");
        expect(etiquetaCuentasAnuales({ descripcion: "", tipo: "Perdidas y ganancias" })).toBe("Profit and loss");
        expect(textoCabeceraLibroDiario("Debe")).toBe("Debit");
    });

    test("validaciones con datos en el idioma activo", async () => {
        const asiento = {
            ejercicioId: "2026",
            fecha: "2026-01-01",
            concepto: "x",
            tipoDocumento: "",
            documento: "",
            partidas: [
                { subcuentaId: 1, debe: 10, haber: 0, concepto: "" },
                { subcuentaId: 2, debe: 0, haber: 7.5, concepto: "" },
            ],
        } as never;
        const validar = metaNuevoAsientoManual.validacion as (m: unknown) => unknown;
        expect(validar(asiento)).toBe("El asiento está descuadrado en 2.50");
        await cambiarIdioma("en");
        expect(validar(asiento)).toBe("The entry is out of balance by 2.50");
    });

    test("un componente cambia de idioma en caliente", async () => {
        render(<RenumerarAsientos ejercicioId="2026" publicar={async () => {}} />);
        expect(screen.getByText("Renumerar asientos")).toBeInTheDocument();
        await act(() => cambiarIdioma("en"));
        expect(screen.getByText("Renumber entries")).toBeInTheDocument();
        expect(screen.getByText("Renumber")).toBeInTheDocument();
    });
});
