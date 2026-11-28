import { Vista } from "@olula/componentes/vista/Vista.tsx";
import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, test, vi } from "vitest";
import { BorrarCliente } from "../borrar/BorrarCliente.tsx";

const respuesta409 = (texto: string) =>
    vi.fn(async () => new Response(texto, { status: 409 }));

afterEach(async () => {
    vi.unstubAllGlobals();
    await act(() => cambiarIdioma("es"));
    localStorage.clear();
});

describe("Borrar un cliente con documentos", () => {
    test("se cierra la confirmación, se ve el error del servidor y no se publica el borrado", async () => {
        await cambiarIdioma("en");
        vi.stubGlobal("fetch", respuesta409(
            "Customer 000001 cannot be deleted because it has invoices. You can deactivate it instead"));
        const publicar = vi.fn(async () => {});
        const onCancelar = vi.fn();
        render(
            <MemoryRouter>
                <Vista>
                    <BorrarCliente clienteId="000001" clienteNombre="ACME" publicar={publicar} onCancelar={onCancelar} />
                </Vista>
            </MemoryRouter>
        );

        await act(async () => {
            screen.getByText("OK").click();
        });

        expect(await screen.findByText("Error deleting the customer")).toBeInTheDocument();
        expect(screen.getByText(
            "Customer 000001 cannot be deleted because it has invoices. You can deactivate it instead"
        )).toBeInTheDocument();
        expect(publicar).not.toHaveBeenCalled();
        expect(onCancelar).toHaveBeenCalledOnce();
    });
});
