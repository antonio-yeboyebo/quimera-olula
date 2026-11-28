import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { metaTablaLineaVenta } from "../../venta/vistas/metatabla_linea_venta.tsx";
import { AprobarPresupuesto } from "../aprobar/AprobarPresupuesto.tsx";
import { widgetsPresupuesto } from "../dominio.ts";
import { metaTablaPresupuesto } from "../maestro/diseño.ts";
import { EstadoPresupuesto } from "../vistas/EstadoPresupuesto.tsx";

afterEach(async () => {
    await act(() => cambiarIdioma("es"));
    localStorage.clear();
});

describe("Presupuestos en español e inglés", () => {
    test("columnas, widgets y líneas en el idioma activo", async () => {
        expect(metaTablaPresupuesto().map((c) => c.cabecera)).toEqual(["Código", "Cliente", "Fecha", "Total", "Agente", "Almacén"]);
        await cambiarIdioma("en");
        expect(metaTablaPresupuesto().map((c) => c.cabecera)).toEqual(["Code", "Customer", "Date", "Total", "Sales agent", "Warehouse"]);
        expect(widgetsPresupuesto().widgets.map((w) => w.titulo)).toEqual(["Quotes", "Quoted amount", "Taxable base", "Average quote"]);
        expect(metaTablaLineaVenta().metaCols["cantidad"]?.cabecera).toBe("Quantity");
    });

    test("confirmación de aprobación y estado", async () => {
        render(<><AprobarPresupuesto publicar={async () => {}} /><EstadoPresupuesto aprobado /></>);
        expect(screen.getByText("Confirmar aprobación")).toBeInTheDocument();
        await act(() => cambiarIdioma("en"));
        expect(screen.getByText("Confirm approval")).toBeInTheDocument();
        expect(screen.getByTitle("Approved")).toBeInTheDocument();
    });
});
