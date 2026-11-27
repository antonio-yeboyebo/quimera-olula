import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { CATALOGO } from "../dashboard/dominio.ts";
import { DASHBOARDS_POR_DEFECTO } from "../dashboard/por_defecto.ts";
import { CatalogoComponentes } from "../dashboard/vistas/CatalogoComponentes.tsx";
import { metaFiltroDivisa, metaTablaDivisa } from "../divisa/maestro/diseño.ts";
import { descripcionFrecuencia } from "../tarea_programada_ia/dominio.ts";

afterEach(async () => {
    await act(() => cambiarIdioma("es"));
});

describe("Comunes en español e inglés", () => {
    test("columnas y filtros de divisas en el idioma activo", async () => {
        expect(metaTablaDivisa[0].cabecera).toBe("Código");
        expect(metaFiltroDivisa.descripcion.label).toBe("Descripción");
        await cambiarIdioma("en");
        expect(metaTablaDivisa.map((c) => c.cabecera)).toContain("Conversion rate");
        expect(metaFiltroDivisa.descripcion.label).toBe("Description");
    });

    test("catálogo y dashboards por defecto se traducen al leerlos", async () => {
        await cambiarIdioma("en");
        expect(CATALOGO[0].nombre).toBe("Card");
        // El grupo es la clave en español: no cambia con el idioma.
        expect(CATALOGO[0].grupo).toBe("Indicadores");
        expect(DASHBOARDS_POR_DEFECTO.inicio.nombre).toBe("Home");
        expect(DASHBOARDS_POR_DEFECTO.inicio.componentes[0].titulo).toBe("Invoiced this month");
        await cambiarIdioma("es");
        expect(DASHBOARDS_POR_DEFECTO.inicio.componentes[0].titulo).toBe("Facturado este mes");
    });

    test("frecuencia de una tarea programada", async () => {
        await cambiarIdioma("en");
        expect(descripcionFrecuencia("30 8 * * *")).toBe("Every day at 08:30");
    });

    test("panel de añadir componentes", async () => {
        await act(() => cambiarIdioma("en"));
        render(<CatalogoComponentes lleno={false} conIA={false} onElegir={() => undefined} />);
        expect(screen.getByText("Add component")).toBeInTheDocument();
        expect(screen.getByText("Indicators")).toBeInTheDocument();
        expect(screen.getByText("Card")).toBeInTheDocument();
    });
});
