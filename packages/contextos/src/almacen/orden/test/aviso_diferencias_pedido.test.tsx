import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { DiferenciaPedidoOrden } from "../diseño.ts";
import { ordenVacia, textoDiferenciaPedido } from "../dominio.ts";
import { diferenciaPedidoDesdeApi, getDiferenciasPedidoOrden } from "../infraestructura.ts";
import { AlbaranarOrden } from "../vistas/albaranar/AlbaranarOrden.tsx";

vi.mock("../infraestructura.ts", async (original) => ({
    ...(await original<typeof import("../infraestructura.ts")>()),
    getDiferenciasPedidoOrden: vi.fn(),
    albaranarOrden: vi.fn(),
}));

const diferencia = (cambios: Partial<DiferenciaPedidoOrden> = {}): DiferenciaPedidoOrden => ({
    tipo: "FALTA",
    pedidoId: "10",
    pedido: "PED-10",
    lineaPedidoId: "1",
    sku: "A",
    descripcion: "Tornillo",
    pendientePedido: 8,
    enOrden: 5,
    enOtrasSalidas: 0,
    diferencia: 3,
    ...cambios,
});

describe("diferenciaPedidoDesdeApi", () => {
    test("pasa de snake_case a camelCase y los ids a texto", () => {
        expect(diferenciaPedidoDesdeApi({
            tipo: "SOBRA", pedido_id: "10", pedido: "PED-10", linea_pedido_id: "7",
            sku: "A", descripcion: "Tornillo", pendiente_pedido: 2, en_orden: 5,
            en_otras_salidas: 0, diferencia: 3,
        })).toEqual(diferencia({ tipo: "SOBRA", lineaPedidoId: "7", pendientePedido: 2, enOrden: 5 }));
    });
});

describe("textoDiferenciaPedido", () => {
    test("falta", () => {
        expect(textoDiferenciaPedido(diferencia())).toBe(
            "PED-10: A Tornillo. Faltan 3 (el pedido tiene pendiente 8, la orden saca 5).");
    });

    test("falta teniendo en cuenta otras salidas", () => {
        expect(textoDiferenciaPedido(diferencia({ enOtrasSalidas: 2, diferencia: 1 }))).toBe(
            "PED-10: A Tornillo. Faltan 1 (el pedido tiene pendiente 8, la orden saca 5, 2 en otras salidas).");
    });

    test("sobra de una línea borrada del pedido", () => {
        expect(textoDiferenciaPedido(diferencia({
            tipo: "SOBRA", pedido: "", descripcion: "Línea borrada del pedido",
            pendientePedido: 0, enOrden: 4, diferencia: 4,
        }))).toBe("A Línea borrada del pedido. Sobran 4 (el pedido tiene pendiente 0, la orden saca 4).");
    });
});

describe("AlbaranarOrden avisa si la orden no cuadra con el pedido", () => {
    const orden = { ...ordenVacia(), id: "S1", tipo: "SALIDA" as const, estado: "PREPARADA", descripcion: "Salida 1" };
    const pintar = () => render(<MemoryRouter><AlbaranarOrden publicar={vi.fn()} orden={orden} /></MemoryRouter>);

    test("sin diferencias no hay aviso y se ofrece Albaranar", async () => {
        vi.mocked(getDiferenciasPedidoOrden).mockResolvedValue([]);
        pintar();
        expect(await screen.findByRole("button", { name: "Albaranar", hidden: true })).toBeTruthy();
        expect(screen.queryByRole("alert", { hidden: true })).toBeNull();
    });

    test("con diferencias muestra cada línea y pide confirmar", async () => {
        vi.mocked(getDiferenciasPedidoOrden).mockResolvedValue([
            diferencia(),
            diferencia({ tipo: "SOBRA", lineaPedidoId: "2", sku: "B", pendientePedido: 1, enOrden: 3, diferencia: 2 }),
        ]);
        pintar();
        expect(await screen.findByRole("button", { name: "Albaranar igualmente", hidden: true })).toBeTruthy();
        const aviso = screen.getByRole("alert", { hidden: true });
        expect(aviso.textContent).toContain("Faltan 3");
        expect(aviso.textContent).toContain("Sobran 2");
    });

    test("si la comprobación falla deja albaranar sin aviso", async () => {
        vi.mocked(getDiferenciasPedidoOrden).mockRejectedValue(new Error("caída"));
        pintar();
        expect(await screen.findByRole("button", { name: "Albaranar", hidden: true })).toBeTruthy();
        expect(screen.queryByRole("alert", { hidden: true })).toBeNull();
    });
});
