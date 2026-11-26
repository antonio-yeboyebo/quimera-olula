import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { act } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { descripcionEstadoExpedicion, metaTablaFactura, widgetsFactura } from "../dominio.ts";

afterEach(async () => {
    await act(() => cambiarIdioma("es"));
    localStorage.clear();
});

describe("Facturas en español e inglés", () => {
    test("columnas, estados de expedición y widgets en el idioma activo", async () => {
        expect(descripcionEstadoExpedicion("ERROR_FIRMA")).toBe("Error de firma");
        await cambiarIdioma("en");
        expect(descripcionEstadoExpedicion("ERROR_FIRMA")).toBe("Signature error");
        expect(descripcionEstadoExpedicion("")).toBe("Not issued");
        expect(metaTablaFactura().map((c) => c.cabecera)).toEqual(
            ["Code", "Customer", "Date", "Total", "Sales agent", "Warehouse"]);
        expect(widgetsFactura().widgets.map((w) => w.titulo)).toEqual(
            ["Invoices", "Total invoiced", "Taxable base", "Average ticket"]);
    });
});
