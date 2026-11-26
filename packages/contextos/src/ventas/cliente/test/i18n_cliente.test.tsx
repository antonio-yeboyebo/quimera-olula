import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { validacionCampoModelo } from "@olula/lib/dominio.ts";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { BorrarCliente } from "../borrar/BorrarCliente.tsx";
import { CrearCliente } from "../crear/CrearCliente.tsx";
import { opcionesTipoVia } from "../crear_direccion/dominio.ts";
import { metaNuevaCuentaBanco } from "../detalle/cuentas_banco/dominio.ts";
import { metaFiltroCliente, metaTablaCliente } from "../maestro/diseño.ts";

afterEach(async () => {
    await act(() => cambiarIdioma("es"));
    localStorage.clear();
});

describe("Clientes en español e inglés", () => {
    test("columnas y filtros del maestro en el idioma activo", async () => {
        expect(metaTablaCliente().map((c) => c.cabecera)).toEqual(["Id", "Nombre", "Email", "Teléfono", "Id Fiscal"]);
        await cambiarIdioma("en");
        expect(metaTablaCliente().map((c) => c.cabecera)).toEqual(["Id", "Name", "Email", "Phone", "Tax ID"]);
        expect(metaFiltroCliente().de_baja.label).toBe("Inactive");
        expect(metaFiltroCliente().agente_id.label).toBe("Sales agent");
    });

    test("el alta cambia de idioma en caliente sin perder lo escrito", async () => {
        localStorage.setItem("whoami", JSON.stringify({ empresas: [{ id: "1", nombre: "A" }, { id: "2", nombre: "B" }] }));
        render(<CrearCliente />);
        expect(screen.getByText("Nuevo Cliente")).toBeInTheDocument();
        expect(screen.getByText(/Sin empresa activa/)).toBeInTheDocument();

        await act(() => cambiarIdioma("en"));

        expect(screen.getByText("New Customer")).toBeInTheDocument();
        expect(screen.getByText(/No active company/)).toBeInTheDocument();
        expect(screen.getByText("Add address")).toBeInTheDocument();
        expect(screen.getByText("Save")).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    test("confirmación de borrado con el nombre del cliente", async () => {
        await cambiarIdioma("en");
        render(<BorrarCliente clienteId="1" clienteNombre="ACME" />);
        expect(screen.getByText("Confirm delete")).toBeInTheDocument();
        expect(screen.getByText('Are you sure you want to delete the customer "ACME"?')).toBeInTheDocument();
    });

    test("validaciones: requerido e IBAN en el idioma activo", async () => {
        const validar = validacionCampoModelo(metaNuevaCuentaBanco);
        expect(validar({ descripcion: "", iban: "ES00" }, "iban")).toBe("El IBAN no es válido");
        await cambiarIdioma("en");
        expect(validar({ descripcion: "", iban: "ES00" }, "iban")).toBe("The IBAN is not valid");
        expect(validar({ descripcion: "", iban: "" }, "iban")).toBe("Required field");
    });

    test("tipos de vía: se traduce lo que se ve, el valor sigue en español", async () => {
        await cambiarIdioma("en");
        expect(opcionesTipoVia()[0]).toEqual({ valor: "Calle", descripcion: "Street" });
    });
});
