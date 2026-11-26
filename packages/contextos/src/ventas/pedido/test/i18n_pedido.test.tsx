import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { widgetsPedido } from "../dominio.ts";
import { AlbaranarPedidos } from "../maestro/AlbaranarPedidos.tsx";
import { etiquetaEstadoPedido } from "../maestro/maestro.ts";
import { getMetaTablaPedido } from "../maestro/metatabla_pedido.tsx";

afterEach(async () => {
    await act(() => cambiarIdioma("es"));
    localStorage.clear();
});

describe("Pedidos en español e inglés", () => {
    test("columnas, estados y widgets en el idioma activo", async () => {
        expect(getMetaTablaPedido().map((c) => c.cabecera)).toContain("Fecha salida");
        await cambiarIdioma("en");
        expect(getMetaTablaPedido().map((c) => c.cabecera)).toEqual(
            ["Status", "Code", "Customer", "Date", "Total", "Sales agent", "Warehouse", "Departure date"]);
        expect(etiquetaEstadoPedido({ servido: "Parcial" }).texto).toBe("Partial");
        expect(widgetsPedido().titulo).toBe("Orders");
    });

    test("albaranar varios pedidos: plurales", async () => {
        const grupos = [{ etiqueta: "ACME", ids: ["1", "2"] }, { etiqueta: "ACME", ids: ["3"] }];
        render(<AlbaranarPedidos publicar={async () => {}} pedidos={3} grupos={grupos} />);
        await act(() => cambiarIdioma("en"));
        expect(screen.getByText("Deliver orders")).toBeInTheDocument();
        expect(screen.getByText(/Deliver the 3 selected orders\. 2 delivery notes will be created\./)).toBeInTheDocument();
        expect(screen.getByText(/ACME — 3 orders in 2 delivery notes/)).toBeInTheDocument();
    });
});
