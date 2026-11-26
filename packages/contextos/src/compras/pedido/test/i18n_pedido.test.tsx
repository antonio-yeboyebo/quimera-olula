import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { BorrarPedido } from "../borrar/BorrarPedido.tsx";
import { metaTablaLineaPedido } from "../detalle/lineas/metatabla_linea_pedido.tsx";
import { Pedido } from "../diseño.ts";
import { AlbaranarPedidos } from "../maestro/AlbaranarPedidos.tsx";

afterEach(async () => {
    await act(() => cambiarIdioma("es"));
});

describe("Pedidos de compra en español e inglés", () => {
    test("albaranar varios pedidos: cabecera y plurales", async () => {
        const grupos = [
            { etiqueta: "ACME", ids: ["1"] },
            { etiqueta: "Otro", ids: ["2", "3"] },
        ];
        render(<AlbaranarPedidos pedidos={3} grupos={grupos} publicar={async () => {}} />);
        expect(screen.getByText(/Se generarán 2 albaranes\./)).toBeInTheDocument();

        await act(() => cambiarIdioma("en"));

        expect(screen.getByText("Create delivery notes from orders")).toBeInTheDocument();
        expect(screen.getByText(/2 delivery notes will be created\./)).toBeInTheDocument();
        expect(screen.getByText(/ACME — 1 order · Otro — 2 orders/)).toBeInTheDocument();
    });

    test("borrado y columnas de las líneas", async () => {
        await cambiarIdioma("en");
        render(<BorrarPedido pedido={{ id: "1", codigo: "P001" } as Pedido} publicar={async () => {}} />);
        expect(screen.getByText("Are you sure you want to delete the order P001?")).toBeInTheDocument();
        expect(metaTablaLineaPedido().map((c) => c.cabecera)).toContain("Received");
    });
});
