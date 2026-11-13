import { MovimientoRecibo, ReciboVenta } from "#/tesoreria/recibo_venta/diseño.ts";
import { cuentaUltimoPago, reciboDevolvible, reciboPagable } from "#/tesoreria/recibo_venta/dominio.ts";
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

describe("solo se devuelve un recibo pagado", () => {
    test("pagado se devuelve", () => {
        expect(reciboDevolvible(conEstado("Pagado"))).toBe(true);
        expect(reciboDevolvible(conEstado(" PAGADO "))).toBe(true);
    });

    test("emitido, devuelto o agrupado no", () => {
        expect(reciboDevolvible(conEstado("Emitido"))).toBe(false);
        expect(reciboDevolvible(conEstado("Devuelto"))).toBe(false);
        expect(reciboDevolvible(conEstado("Agrupado"))).toBe(false);
    });

    test("un recibo sin cargar no", () => {
        expect(reciboDevolvible(reciboVentaInicial())).toBe(false);
    });
});

const movimiento = (
    fecha: string,
    tipo: string,
    cuentaPagoId: string,
    estado = true
): MovimientoRecibo => ({
    id: `${tipo}-${fecha}`,
    fecha: new Date(fecha),
    tipo,
    estado,
    cuentaPagoId,
    nombreCuentaPago: `Cuenta ${cuentaPagoId}`,
    pasarela: null,
    modoPasarela: null,
    urlPanel: null,
    incidenciaPasarela: null,
});

const conPagos = (pagos: MovimientoRecibo[]): ReciboVenta => ({
    ...reciboVentaInicial(),
    pagos,
});

describe("la devolución sale por la cuenta del último pago", () => {
    test("toma el pago vigente más reciente", () => {
        const recibo = conPagos([
            movimiento("2026-01-10", "Pago", "A"),
            movimiento("2026-02-10", "Devolución", "A"),
            movimiento("2026-03-10", "Pago", "B"),
        ]);
        expect(cuentaUltimoPago(recibo)).toEqual({ id: "B", nombre: "Cuenta B" });
    });

    test("no depende de que el pago sea editable", () => {
        const recibo = conPagos([
            movimiento("2026-01-10", "Pago", "A", false),
        ]);
        expect(cuentaUltimoPago(recibo)?.id).toBe("A");
    });

    test("sin pagos no hay cuenta", () => {
        expect(cuentaUltimoPago(reciboVentaInicial())).toBeNull();
    });
});
