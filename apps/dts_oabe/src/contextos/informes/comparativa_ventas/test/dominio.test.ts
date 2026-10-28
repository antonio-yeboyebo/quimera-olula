import { describe, expect, test } from "vitest";
import {
    anioDesde,
    filtroInformeComparativaVentasVacio,
    nombreFicheroInformeComparativaVentas,
    validarFiltro,
} from "../dominio.ts";

const filtro = (cambios = {}) => ({ ...filtroInformeComparativaVentasVacio(), anioHasta: "2025", ...cambios });

describe("Informe comparativa de ventas", () => {
    test("el año desde son dos años antes del año hasta", () => {
        expect(anioDesde("2025")).toBe("2023");
        expect(anioDesde("25")).toBe("");
    });

    test("el año hasta debe tener 4 cifras", () => {
        expect(validarFiltro(filtro())).toBeNull();
        expect(validarFiltro(filtro({ anioHasta: "" }))).not.toBeNull();
        expect(validarFiltro(filtro({ anioHasta: "20a5" }))).not.toBeNull();
    });

    test("solo compara día y mes de las fechas", () => {
        expect(validarFiltro(filtro({ fechaDesde: "2025-03-01", fechaHasta: "2024-06-30" }))).toBeNull();
        expect(validarFiltro(filtro({ fechaDesde: "2024-11-01", fechaHasta: "2025-02-01" }))).not.toBeNull();
    });

    test("con objetivo no se validan las fechas", () => {
        expect(validarFiltro(filtro({
            fechaDesde: "2024-11-01", fechaHasta: "2025-02-01", mostrarObjetivo: true,
        }))).toBeNull();
    });

    test("nombre del fichero", () => {
        expect(nombreFicheroInformeComparativaVentas("2025")).toBe("comparativa_ventas_2023-2025.pdf");
    });
});
