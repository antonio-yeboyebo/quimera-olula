import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, vi, beforeEach } from "vitest";
import { AsistenteRuntimeProvider } from "#/asistente/vistas/AsistenteRuntimeProvider.tsx";
import { Chat } from "#/asistente/vistas/Chat.tsx";

const respuestaConAccionNavegacion = {
    respuesta: "Puedo hacerlo desde el formulario de pedidos.",
    threadId: "hilo-1",
    a2uiMessages: [],
    capacidadesHash: null,
    necesitaCapacidades: false,
    accionNavegacion: { ruta: "/ventas/pedido", parametros: {}, descripcion: "Pedidos" },
};

vi.mock("#/asistente/infraestructura.ts", () => ({
    consultarIa: vi.fn(async () => respuestaConAccionNavegacion),
    consultarIaStream: vi.fn(),
    listarHilos: vi.fn(async () => []),
    obtenerMensajesHilo: vi.fn(async () => ({ threadId: "hilo-1", mensajes: [] })),
}));

beforeEach(() => {
    localStorage.clear();
    globalThis.ResizeObserver ??= class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
    Element.prototype.scrollTo ??= () => {};
});

test("[asistente-chat-03] accion_navegacion ya no navega sola: muestra un botón y solo navega al pulsarlo", async () => {
    const onAccionNavegacion = vi.fn();

    render(
        <AsistenteRuntimeProvider onAccionNavegacion={onAccionNavegacion}>
            <Chat />
        </AsistenteRuntimeProvider>
    );

    const textarea = await screen.findByPlaceholderText("Escribe un mensaje…");
    await userEvent.type(textarea, "¿Cómo creo un pedido?");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    const boton = await screen.findByRole("button", { name: "Ir a Pedidos" });
    expect(onAccionNavegacion).not.toHaveBeenCalled();

    await userEvent.click(boton);

    expect(onAccionNavegacion).toHaveBeenCalledWith({ ruta: "/ventas/pedido", parametros: {} });
});
