import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { act } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { albaranVacio, etiquetaEstadoAlbaran, metaTablaAlbaran, tituloAlbaran, widgetsAlbaran } from "../dominio.ts";

afterEach(async () => {
    await act(() => cambiarIdioma("es"));
    localStorage.clear();
});

describe("Albaranes en español e inglés", () => {
    test("columnas, estado, título y widgets en el idioma activo", async () => {
        expect(etiquetaEstadoAlbaran({ facturado: true }).texto).toBe("Facturado");
        await cambiarIdioma("en");
        expect(metaTablaAlbaran().map((c) => c.cabecera)).toEqual(
            ["Code", "Customer", "Date", "Total", "Sales agent", "Warehouse", "Credit"]);
        expect(etiquetaEstadoAlbaran({ facturado: false }).texto).toBe("Pending");
        expect(tituloAlbaran({ ...albaranVacio(), de_abono: true })).toBe("New Delivery Note · Credit");
        expect(widgetsAlbaran().titulo).toBe("Delivery notes");
    });
});
