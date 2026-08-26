import { ReciboVenta } from "#/tesoreria/recibo_venta/diseño.ts";
import { reciboPagable } from "#/tesoreria/recibo_venta/dominio.ts";
import { reciboVentaInicial } from "#/tesoreria/recibo_venta/detalle/detalle.ts";
import { describe, expect, test } from "vitest";

const conEstado = (estado: string): ReciboVenta => ({
    ...reciboVentaInicial(),
    estado,
});

describe("solo se cobra un recibo emitido o devuelto", () => {
    test("emitido y devuelto se pagan", () => {
        expect(reciboPagable(conEstado("Emitido"))).toBe(true);
        expect(reciboPagable(conEstado("Devuelto"))).toBe(true);
    });

    test("pagado o anulado no", () => {
        expect(reciboPagable(conEstado("Pagado"))).toBe(false);
        expect(reciboPagable(conEstado("Anulado"))).toBe(false);
    });

    test("un recibo sin cargar no", () => {
        expect(reciboPagable(reciboVentaInicial())).toBe(false);
    });

    test("da igual cómo lo escriba el servidor", () => {
        expect(reciboPagable(conEstado(" EMITIDO "))).toBe(true);
        expect(reciboPagable(conEstado("devuelto"))).toBe(true);
    });
});
