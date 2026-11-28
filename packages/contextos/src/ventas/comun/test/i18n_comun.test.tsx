import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { IndicadorGuardado } from "../componentes/IndicadorGuardado.tsx";
import { desgloseLineaVenta, fiscalidadLineaVenta, tituloLineaVenta } from "../componentes/linea_venta_texto.ts";
import { filtroCliente, filtroFechaDocumento } from "../filtros.tsx";

afterEach(async () => {
    await act(() => cambiarIdioma("es"));
    localStorage.clear();
});

const linea = {
    referencia: "",
    descripcion: "",
    cantidad: 2,
    pvp_unitario: 10,
    pvp_total: 19,
    dto_porcentual: 5,
    grupo_iva_producto_id: "IVA21",
    tipo_irpf: 15,
};

describe("Ventas común en español e inglés", () => {
    test("los filtros compartidos sacan la etiqueta en el idioma activo", async () => {
        expect(filtroCliente.label).toBe("Cliente");
        await cambiarIdioma("en");
        expect(filtroCliente.label).toBe("Customer");
        expect({ ...filtroFechaDocumento }.label).toBe("Date");
    });

    test("textos de las líneas", async () => {
        await cambiarIdioma("en");
        expect(tituloLineaVenta(linea)).toBe("No description");
        expect(desgloseLineaVenta(linea)).toContain("(5% Disc.)");
        expect(fiscalidadLineaVenta(linea)).toBe("VAT IVA21 · Withholding 15%");
    });

    test("indicador de guardado", async () => {
        render(<IndicadorGuardado modificado />);
        expect(screen.getByText("Sin guardar")).toBeInTheDocument();
        await act(() => cambiarIdioma("en"));
        expect(screen.getByText("Unsaved")).toBeInTheDocument();
    });
});
