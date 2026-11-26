import {
    configComprasPorDefecto,
    explicacionActualizarArticulosProveedor,
    opcionesActualizarArticulosProveedor,
} from "#/compras/config/dominio.ts";
import { configComprasAApi, configComprasDesdeApi } from "#/compras/config/infraestructura.ts";
import { describe, expect, test } from "vitest";

describe("configuración de compras", () => {
    test("por defecto no se actualizan los artículos de proveedor, como en el escritorio", () => {
        expect(configComprasPorDefecto.actualizarArticulosProveedor).toBe("No Actualizar");
    });

    test("las opciones son los valores exactos de la columna", () => {
        expect(opcionesActualizarArticulosProveedor().map((o) => o.valor)).toEqual(
            ["No Actualizar", "Albaranes de proveedor", "Facturas de proveedor"]);
    });

    test("ya se aplica en Olula: ninguna opción avisa de que solo se guarda", () => {
        for (const { valor } of opcionesActualizarArticulosProveedor()) {
            expect(explicacionActualizarArticulosProveedor(valor)).not.toContain("Pendiente en Olula");
        }
    });

    test("va y viene de la API", () => {
        const api = { actualizar_articulos_proveedor: "Facturas de proveedor" as const };
        expect(configComprasAApi(configComprasDesdeApi(api))).toEqual(api);
    });
});
