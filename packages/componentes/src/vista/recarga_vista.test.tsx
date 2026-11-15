import { act, render, screen } from "@testing-library/react";
import { Fragment, useState } from "react";
import { MemoryRouter, NavigateFunction, NavigateOptions, Outlet, Route, Routes, useLocation, useNavigate } from "react-router";
import { describe, expect, test } from "vitest";
import { estadoRecargaVista, useClaveRecargaVista } from "./recarga_vista.ts";

let montajes = 0;

/** Como un maestro: lee el id de la URL solo al montarse. */
const Maestro = () => {
    const { search } = useLocation();
    const [idInicial] = useState(() => {
        montajes++;
        return new URLSearchParams(search).get("id");
    });
    return <p>activo: {idInicial ?? "ninguno"}</p>;
};

/** Como Vista: remonta el contenido de la ruta con la clave de recarga. */
const Layout = () => {
    const clave = useClaveRecargaVista();
    return <Fragment key={clave}><Outlet /></Fragment>;
};

/**
 * Se usa `MemoryRouter` y no `createMemoryRouter`: el data router crea un `Request` con un
 * `AbortSignal` en cada navegación, y en jsdom ese `AbortSignal` no es el que espera el
 * `Request` de Node, lo que rompe el test según la versión de Node.
 */
let navegar: NavigateFunction;

const CapturarNavegar = () => {
    navegar = useNavigate();
    return null;
};

const router = {
    navigate: async (to: string, opciones?: NavigateOptions) => { await navegar(to, opciones); },
};

const montar = () => {
    montajes = 0;
    render(
        <MemoryRouter initialEntries={["/ventas/presupuesto?id=1"]}>
            <CapturarNavegar />
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route path="ventas/presupuesto" element={<Maestro />} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );
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
