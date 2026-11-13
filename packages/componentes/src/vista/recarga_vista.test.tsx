import { act, render, screen } from "@testing-library/react";
import { Fragment, useState } from "react";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router";
import { describe, expect, test } from "vitest";
import { estadoRecargaVista, useClaveRecargaVista } from "./recarga_vista.ts";

let montajes = 0;

/** Como un maestro: lee el id de la URL solo al montarse. */
const Maestro = () => {
    const [idInicial] = useState(() => {
        montajes++;
        return new URLSearchParams(window.location.search).get("id")
            ?? new URLSearchParams(router.state.location.search).get("id");
    });
    return <p>activo: {idInicial ?? "ninguno"}</p>;
};

/** Como Vista: remonta el contenido de la ruta con la clave de recarga. */
const Layout = () => {
    const clave = useClaveRecargaVista();
    return <Fragment key={clave}><Outlet /></Fragment>;
};

let router: ReturnType<typeof createMemoryRouter>;

const montar = () => {
    montajes = 0;
    router = createMemoryRouter(
        [{ path: "/", Component: Layout, children: [{ path: "ventas/presupuesto", Component: Maestro }] }],
        { initialEntries: ["/ventas/presupuesto?id=1"] },
    );
    render(<RouterProvider router={router} />);
};

describe("recarga_vista", () => {
    test("navegar a la ruta actual sin marca no remonta la pantalla (el bug)", async () => {
        montar();

        await act(() => router.navigate("/ventas/presupuesto?id=2"));

        expect(montajes).toBe(1);
        expect(screen.getByText("activo: 1")).toBeTruthy();
    });

    test("con estadoRecargaVista() la pantalla se remonta y relee el id", async () => {
        montar();

        await act(() => router.navigate("/ventas/presupuesto?id=2", { state: estadoRecargaVista() }));

        expect(montajes).toBe(2);
        expect(screen.getByText("activo: 2")).toBeTruthy();
    });

    test("cada navegación marcada recarga, aunque sea a la misma URL", async () => {
        montar();

        await act(() => router.navigate("/ventas/presupuesto?id=2", { state: estadoRecargaVista() }));
        await act(() => router.navigate("/ventas/presupuesto?id=2", { state: estadoRecargaVista() }));

        expect(montajes).toBe(3);
    });

    test("una navegación posterior sin marca no vuelve a remontar", async () => {
        montar();

        await act(() => router.navigate("/ventas/presupuesto?id=2", { state: estadoRecargaVista() }));
        await act(() => router.navigate("/ventas/presupuesto?id=3"));

        expect(montajes).toBe(2);
    });
});
