import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { Factura } from "../diseño.ts";
import { descripcionOrigenFactura } from "../dominio.ts";
import { RegistrarFactura } from "../registrar/RegistrarFactura.tsx";
import { etiquetaAlerta, etiquetaAlertaLinea, motivosNoConfirmable } from "../vistas/validar_importacion/dominio.ts";
import { FacturaLeida } from "../vistas/validar_importacion/diseño.ts";
import { VisorFichero } from "../vistas/validar_importacion/VisorFichero.tsx";

afterEach(async () => {
    await act(() => cambiarIdioma("es"));
});

describe("Facturas de compra en español e inglés", () => {
    test("registrar la factura", async () => {
        render(<RegistrarFactura factura={{ id: "1", codigo: "F001" } as Factura} publicar={async () => {}} />);
        expect(screen.getByText(/¿Registrar la factura F001\?/)).toBeInTheDocument();
        await act(() => cambiarIdioma("en"));
        expect(screen.getByText(/Register the invoice F001\?/)).toBeInTheDocument();
    });

    test("importación: alertas, motivos y visor", async () => {
        await cambiarIdioma("en");
        expect(etiquetaAlerta("sin_proveedor")).toBe("Supplier missing");
        expect(etiquetaAlerta("desconocida")).toBe("desconocida");
        expect(etiquetaAlertaLinea("sin_precio")).toBe("No price");
        expect(motivosNoConfirmable({ lineas: [] } as unknown as FacturaLeida, null)).toEqual(["Proposal not calculated"]);
        expect(descripcionOrigenFactura({ automatica: true } as Factura)).toBe("From delivery notes");
        render(<VisorFichero fichero={null} />);
        expect(screen.getByText("Original file not available")).toBeInTheDocument();
    });
});
