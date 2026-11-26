import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { metaTablaFamilia } from "../familia/vistas/maestro/diseño.ts";
import { INFORME_INVENTARIO_VALORADO } from "../informe_inventario/pestañas.ts";
import { opcionesEtiquetaDesdeForm } from "../lote/dominio.ts";
import { funcionesZona } from "../zona/dominio.ts";
import { CrearFamilia } from "../familia/vistas/CrearFamilia.tsx";

afterEach(async () => {
    await act(() => cambiarIdioma("es"));
    localStorage.clear();
});

describe("Almacén en español e inglés", () => {
    test("las columnas del maestro se traducen al leerlas, sin rehacer la tabla", async () => {
        expect(metaTablaFamilia.map((c) => c.cabecera)).toEqual(["Código Familia", "Descripcion"]);
        await cambiarIdioma("en");
        expect(metaTablaFamilia.map((c) => c.cabecera)).toEqual(["Family Code", "Description"]);
    });

    test("opciones: se traduce lo que se ve, el valor no cambia", async () => {
        await cambiarIdioma("en");
        expect(funcionesZona[0]).toEqual({ valor: "RECEPCION", descripcion: "Receiving" });
        const valoracion = INFORME_INVENTARIO_VALORADO.filas.at(-1)![0];
        expect(valoracion.label).toBe("Valuation");
        expect(valoracion.opciones?.[0]).toEqual({ valor: "Coste medio", descripcion: "Average cost" });
    });

    test("validaciones con datos en el idioma activo", async () => {
        expect(opcionesEtiquetaDesdeForm({ copias: "0", formato: "3x9", cantidad: "" })).toBe(
            "Las copias deben ser un número entero de 1 a 500",
        );
        await cambiarIdioma("en");
        expect(opcionesEtiquetaDesdeForm({ copias: "0", formato: "3x9", cantidad: "" })).toBe(
            "Copies must be an integer from 1 to 500",
        );
    });

    test("un componente cambia de idioma en caliente", async () => {
        render(<CrearFamilia activo />);
        expect(screen.getByText("Nueva Familia")).toBeInTheDocument();
        await act(() => cambiarIdioma("en"));
        expect(screen.getByText("New Family")).toBeInTheDocument();
        expect(screen.getByText("Save")).toBeInTheDocument();
    });
});
