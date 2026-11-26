import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { describirValorFiltro } from "../maestro/maestroFiltros/dominio.ts";
import { SelectorModo } from "../maestro/SelectorModo.tsx";
import { QModalConfirmacion } from "../moleculas/qmodalconfirmacion.tsx";
import { SinDatos } from "../SinDatos/SinDatos.tsx";
import { nombreMenu } from "./textos.ts";

afterEach(async () => {
    await act(() => cambiarIdioma("es"));
});

describe("componentes traducidos", () => {
    test("selector de modo y sin datos cambian de idioma en caliente", async () => {
        render(<>
            <SelectorModo modos={["tabla", "tarjetas"]} modo="tabla" onCambio={() => null} />
            <SinDatos />
        </>);
        expect(screen.getByText("Tabla")).toBeInTheDocument();
        expect(screen.getByText("No hay datos")).toBeInTheDocument();

        await act(() => cambiarIdioma("en"));

        expect(screen.getByText("Table")).toBeInTheDocument();
        expect(screen.getByText("Cards")).toBeInTheDocument();
        expect(screen.getByText("No data")).toBeInTheDocument();
    });

    test("confirmación: Cancelar y Aceptar en inglés", async () => {
        await cambiarIdioma("en");
        render(<QModalConfirmacion nombre="x" abierto titulo="Confirm" mensaje="Sure?"
            onCerrar={() => undefined} onAceptar={() => undefined} />);
        expect(screen.getByText("Cancel")).toBeInTheDocument();
        expect(screen.getByText("OK")).toBeInTheDocument();
    });

    test("chips de filtro: atajos de fecha, meses y Sí/No", async () => {
        const fecha = { id: "fecha", label: "Fecha", tipo: "intervalo_fechas", filtro: () => null } as const;
        const baja = { id: "baja", label: "De baja", tipo: "checkbox", filtro: () => null } as const;
        expect(describirValorFiltro(fecha, "@este-año")).toBe("Este año");
        await cambiarIdioma("en");
        expect(describirValorFiltro(fecha, "@este-año")).toBe("This year");
        expect(describirValorFiltro(baja, "true")).toBe("Yes");
    });

    test("entradas de menú: las conocidas se traducen y el resto sale tal cual", async () => {
        await cambiarIdioma("en");
        expect(nombreMenu("Clientes")).toBe("Customers");
        expect(nombreMenu("Mi cuenta")).toBe("My account");
        expect(nombreMenu("Tesorería")).toBe("Tesorería");
    });
});
