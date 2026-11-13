import { describe, test, expect } from "vitest";
import { formatearMoneda, resolverDivisa } from "@olula/lib/dominio.ts";
import { Entidad } from "@olula/lib/diseño.ts";
import { columnasAMetaTabla } from "#/asistente/vistas/catalogo/columnas.ts";

const divisaDe = (columna: ReturnType<typeof columnasAMetaTabla>[number], entidad: Entidad) =>
    resolverDivisa(columna.divisa, entidad);

describe("columnasAMetaTabla", () => {
    test("una columna de moneda con divisa fija la conserva", () => {
        const [columna] = columnasAMetaTabla([
            { id: "total", cabecera: "Total", tipo: "moneda", divisa: "USD" },
        ]);

        expect(divisaDe(columna, { id: "1", total: 36.3 })).toBe("USD");
    });

    test("campoDivisa toma la divisa de cada fila", () => {
        const [columna] = columnasAMetaTabla([
            { id: "total", cabecera: "Total", tipo: "moneda", campoDivisa: "divisa" },
        ]);

        expect(divisaDe(columna, { id: "1", divisa: "GBP" })).toBe("GBP");
        expect(divisaDe(columna, { id: "2", divisa: "EUR" })).toBe("EUR");
        expect(columna).not.toHaveProperty("campoDivisa");
    });

    test("sin divisa en la fila, campoDivisa cae a la divisa fija o a EUR", () => {
        const [conFija, sinFija] = columnasAMetaTabla([
            { id: "total", cabecera: "Total", tipo: "moneda", campoDivisa: "divisa", divisa: "USD" },
            { id: "neto", cabecera: "Neto", tipo: "moneda", campoDivisa: "divisa" },
        ]);

        expect(divisaDe(conFija, { id: "1" })).toBe("USD");
        expect(divisaDe(sinFija, { id: "1", divisa: "" })).toBe("EUR");
    });

    test("un importe se muestra con dos decimales y su divisa", () => {
        expect(formatearMoneda(36.3, "EUR")).toMatch(/^36,30\s€$/);
    });
});
