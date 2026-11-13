import { describe, expect, it } from "vitest";
import { EstadoVisor, MensajeVisor } from "../diseño.ts";
import { LineaFactura, VentaTpv } from "../../venta/diseño.ts";
import { aplicarMensajeVisor, estadoVisorVacio, metodoCobroDeEstado, ventaVisorDesdeVenta } from "../dominio.ts";
import { ventaVisor } from "./fixtures.ts";

const aplicar = (...mensajes: MensajeVisor[]): EstadoVisor =>
    mensajes.reduce(aplicarMensajeVisor, estadoVisorVacio);

describe("estado del visor de cliente", () => {
    it("traduce los estados de pago del TPV a método de cobro", () => {
        expect(metodoCobroDeEstado("PAGANDO_EN_EFECTIVO")).toBe("efectivo");
        expect(metodoCobroDeEstado("PAGANDO_CON_TARJETA")).toBe("tarjeta");
        expect(metodoCobroDeEstado("PAGANDO_CON_VALE")).toBe("vale");
        expect(metodoCobroDeEstado("PAGANDO_CON_QR")).toBe("qr");
        expect(metodoCobroDeEstado("ABIERTA")).toBeNull();
    });

    it("muestra la venta con sus líneas y el método de cobro", () => {
        const estado = aplicar({ tipo: "venta", venta: ventaVisor(), metodo: "tarjeta" });
        expect(estado.venta?.lineas).toHaveLength(2);
        expect(estado.cobro).toEqual({ metodo: "tarjeta" });
    });

    it("al cancelar el cobro vuelve a la venta sin método", () => {
        const estado = aplicar(
            { tipo: "venta", venta: ventaVisor(), metodo: "vale" },
            { tipo: "venta", venta: ventaVisor(), metodo: null },
        );
        expect(estado.cobro).toBeNull();
        expect(estado.venta?.id).toBe("v1");
    });

    it("el QR se mantiene aunque el TPV vuelva a mandar la venta", () => {
        const estado = aplicar(
            { tipo: "venta", venta: ventaVisor(), metodo: "qr" },
            { tipo: "qr", url: "https://pago.test/cs_1", modo: "test" },
            { tipo: "venta", venta: ventaVisor(), metodo: "qr" },
        );
        expect(estado.cobro?.qr?.url).toBe("https://pago.test/cs_1");
    });

    it("en efectivo calcula el cambio y lo conserva en el pago recibido", () => {
        const estado = aplicar(
            { tipo: "venta", venta: ventaVisor(), metodo: null },
            { tipo: "entregado", importe: 20 },
            { tipo: "venta", venta: ventaVisor(), metodo: "efectivo" },
            { tipo: "pagado", ventaId: "v1", importe: 12.5, divisaId: "EUR" },
            { tipo: "venta", venta: ventaVisor({ pagado: 12.5, pendiente: 0 }), metodo: null },
        );
        expect(estado.pagado).toEqual({ ventaId: "v1", importe: 12.5, divisaId: "EUR", cambio: 7.5 });
    });

    it("el pago recibido desaparece al pasar a otra venta", () => {
        const estado = aplicar(
            { tipo: "venta", venta: ventaVisor(), metodo: "tarjeta" },
            { tipo: "pagado", ventaId: "v1", importe: 12.5, divisaId: "EUR" },
            { tipo: "venta", venta: ventaVisor({ id: "v2" }), metodo: null },
        );
        expect(estado.pagado).toBeNull();
        expect(estado.venta?.id).toBe("v2");
    });
});

describe("venta del TPV para el visor", () => {
    const linea = (cambios: Partial<LineaFactura>): LineaFactura => ({
        id: "l1", referencia: "CAFE", descripcion: "Café", descripcionArticulo: null,
        cantidad: 1, pvp_unitario: 15, dto_porcentual: 0, dto_lineal: 0, pvp_total: 15,
        iva_incluido: false, grupo_iva_producto_id: "G", tipo_irpf: 0, tipo_recargo: 0,
        tipo_iva: 21, por_comision: 0, importe_comision: 0, ...cambios,
    });
    const venta = { id: "v1", codigo: "T1", divisa_id: "EUR", total: 18.15, pagado: 0, pendiente: 18.15 } as VentaTpv;

    it("las líneas sin IVA incluido se muestran con IVA, para que sumen el total", () => {
        const [l] = ventaVisorDesdeVenta(venta, [linea({})]).lineas;
        expect(l.pvpUnitario).toBe(18.15);
        expect(l.total).toBe(18.15);
    });

    it("las líneas con IVA incluido se muestran tal cual", () => {
        const [l] = ventaVisorDesdeVenta(venta, [linea({ iva_incluido: true })]).lineas;
        expect(l.total).toBe(15);
    });
});
