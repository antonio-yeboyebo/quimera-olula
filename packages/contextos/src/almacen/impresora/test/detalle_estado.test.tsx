import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { describe, expect, test, vi } from "vitest";

vi.mock("../infraestructura.ts", () => ({
    getImpresora: vi.fn(async () => ({
        id: "PC45D", codigo: "PC45D", descripcion: "Expediciones", host: "10.0.0.1", puerto: 9100,
        anchoMm: 100, altoMm: 150, puntosPorMm: 8, desplazamientoX: 20, modoSalida: "arrancar",
    })),
    getEstadoImpresora: vi.fn(async () => ({
        lista: true, sinPapel: false, enPausa: false, cabezalAbierto: false, etiquetasEnCola: 0,
    })),
    patchImpresora: vi.fn(),
    postEtiquetaPruebaImpresora: vi.fn(),
    deleteImpresora: vi.fn(),
}));

import { DetalleImpresora } from "../detalle/DetalleImpresora.tsx";

describe("DetalleImpresora", () => {
    test("tras comprobar el estado muestra «Lista»", async () => {
        render(<StrictMode><DetalleImpresora id="PC45D" /></StrictMode>);
        const boton = await screen.findByText("Comprobar estado");
        fireEvent.click(boton);
        await waitFor(() => expect(screen.getByText("Lista")).toBeTruthy(), { timeout: 3000 });
    });
});
