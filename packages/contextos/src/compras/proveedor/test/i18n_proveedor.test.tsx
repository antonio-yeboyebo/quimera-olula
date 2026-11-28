import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { validacionCampoModelo } from "@olula/lib/dominio.ts";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { metaTablaAlbaran } from "../../albaran/maestro/metatabla_albaran.tsx";
import { datosClaveDocumentoCompra } from "../../comun/dominio.ts";
import { opcionesTipoIdFiscalCompras } from "../../comun/valores.ts";
import { etiquetaEstadoFactura } from "../../factura/dominio.ts";
import { Factura } from "../../factura/diseño.ts";
import { metaTablaPedido } from "../../pedido/maestro/metatabla_pedido.tsx";
import { BorrarProveedor } from "../borrar/BorrarProveedor.tsx";
import { CrearProveedor } from "../crear/CrearProveedor.tsx";
import { metaNuevaCuentaBancoProveedor } from "../dominio.ts";
import { Proveedor } from "../diseño.ts";

afterEach(async () => {
    await act(() => cambiarIdioma("es"));
    localStorage.clear();
});

describe("Proveedores en español e inglés", () => {
    test("el alta cambia de idioma en caliente", async () => {
        render(<CrearProveedor publicar={async () => {}} />);
        expect(screen.getByText("Crear proveedor")).toBeInTheDocument();
        expect(screen.getByText(/Sin empresa activa/)).toBeInTheDocument();

        await act(() => cambiarIdioma("en"));

        expect(screen.getByText("Create supplier")).toBeInTheDocument();
        expect(screen.getByText(/No active company/)).toBeInTheDocument();
        expect(screen.getByText("Add address")).toBeInTheDocument();
        expect(screen.getByText("Create")).toBeInTheDocument();
    });

    test("confirmación de borrado con el nombre del proveedor", async () => {
        await cambiarIdioma("en");
        render(<BorrarProveedor proveedor={{ id: "1", nombre: "ACME" } as Proveedor} publicar={async () => {}} />);
        expect(screen.getByText("Delete supplier")).toBeInTheDocument();
        expect(screen.getByText("Are you sure you want to delete the supplier ACME?")).toBeInTheDocument();
    });

    test("tipos de id fiscal: se traduce lo que se ve, el valor no cambia", async () => {
        await cambiarIdioma("en");
        expect(opcionesTipoIdFiscalCompras()[2]).toEqual({ valor: "PASAPORTE", descripcion: "Passport" });
    });

    test("validación del IBAN de la cuenta del proveedor", async () => {
        const validar = validacionCampoModelo(metaNuevaCuentaBancoProveedor);
        await cambiarIdioma("en");
        expect(validar({ descripcion: "x", iban: "ES00", bic: null }, "iban")).toBe("The IBAN is not valid");
    });

    test("columnas de los documentos, estados y datos clave", async () => {
        expect(metaTablaPedido().map((c) => c.cabecera)[1]).toBe("Código");
        await cambiarIdioma("en");
        expect(metaTablaPedido().map((c) => c.cabecera).slice(0, 4)).toEqual(["Status", "Code", "Supplier", "Date"]);
        expect(metaTablaAlbaran().map((c) => c.cabecera)).toContain("Warehouse");
        expect(etiquetaEstadoFactura({ estadoExpedicion: "BORRADOR" } as Factura).texto).toBe("Draft");
        expect(datosClaveDocumentoCompra({ fecha: new Date(2026, 0, 2) }).map((d) => d.etiqueta)).toEqual([
            "Date", "Supplier", "Tax ID", "Business VAT group",
        ]);
    });
});
