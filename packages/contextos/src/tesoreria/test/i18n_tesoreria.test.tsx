import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { BorrarBanco } from "../banco/borrar/BorrarBanco.tsx";
import { Banco } from "../banco/diseño.ts";
import { metaTablaBanco } from "../banco/maestro/diseño.ts";
import { textoEstado } from "../comun/estados.ts";
import { opcionesEstadoMovimientoBancario } from "../conciliacion/dominio.ts";
import { opcionesModoPagoRemesa } from "../config/dominio.ts";
import { opcionesGeneraRecibos } from "../forma_pago/dominio.ts";
import { opcionesEstadoReciboVenta } from "../recibo_venta/dominio.ts";

afterEach(async () => {
    await act(() => cambiarIdioma("es"));
    localStorage.clear();
});

describe("Tesorería en español e inglés", () => {
    test("las columnas del maestro se traducen al leerlas", async () => {
        expect(metaTablaBanco.map((c) => c.cabecera)).toEqual(["Nº de entidad", "Nombre", "Acreedor", "BIC por defecto"]);
        await cambiarIdioma("en");
        expect(metaTablaBanco.map((c) => c.cabecera)).toEqual(["Bank code", "Name", "Creditor", "Default BIC"]);
    });

    test("opciones: se traduce lo que se ve, el valor guardado no cambia", async () => {
        await cambiarIdioma("en");
        expect(opcionesGeneraRecibos[1]).toEqual({ valor: "Pagados", descripcion: "Paid" });
        expect(opcionesModoPagoRemesa[1]).toEqual({ valor: "diferido", descripcion: "Deferred" });
        expect(opcionesEstadoReciboVenta[4]).toEqual({ valor: "Remesado", descripcion: "Remitted" });
        expect(opcionesEstadoMovimientoBancario[2]).toEqual({ valor: "conciliado", descripcion: "Reconciled" });
    });

    test("estados de la BD que se enseñan traducidos", async () => {
        expect(textoEstado("Emitida")).toBe("Emitida");
        await cambiarIdioma("en");
        expect(textoEstado("Emitida")).toBe("Issued");
        expect(textoEstado("Nóminas")).toBe("Payslips");
        expect(textoEstado("Otro")).toBe("Otro");
    });

    test("un componente cambia de idioma en caliente", async () => {
        const banco = { id: "0049", nombre: "Banco X" } as Banco;
        render(<BorrarBanco banco={banco} publicar={async () => {}} />);
        expect(screen.getByText("Borrar banco")).toBeInTheDocument();
        await act(() => cambiarIdioma("en"));
        expect(screen.getByText("Delete bank")).toBeInTheDocument();
    });
});
