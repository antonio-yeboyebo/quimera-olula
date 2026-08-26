import { editable, metaFactura } from "#/ventas/factura/detalle/diseño.ts";
import { EstadoExpedicion, Factura } from "#/ventas/factura/diseño.ts";
import {
    emisionEsReintento,
    estadoExpedicionDesdeApi,
    facturaEmitible,
    facturaVacia,
} from "#/ventas/factura/dominio.ts";
import { modeloEsEditable } from "@olula/lib/dominio.ts";
import { beforeEach, describe, expect, test } from "vitest";

const conEstado = (estadoExpedicion: EstadoExpedicion): Factura => ({
    ...facturaVacia(),
    estadoExpedicion,
});

const abierta = () => conEstado("BORRADOR");

const activarPlugin = () =>
    localStorage.setItem(
        "whoami",
        JSON.stringify({ plugins: { estado_expedicion_factura: "activo" } })
    );

beforeEach(() => localStorage.clear());

describe("sin el plugin de expedición solo se edita el borrador", () => {
    test("en estado BORRADOR se edita", () => {
        expect(editable(abierta())).toBe(true);
    });

    test("una vez emitida ya no", () => {
        expect(editable(conEstado("EMITIDA"))).toBe(false);
        expect(editable(conEstado("FIRMADA"))).toBe(false);
        expect(editable(conEstado("ERROR_FIRMA"))).toBe(false);
    });

    test("sin estado (cadena vacía) se considera cerrada", () => {
        expect(editable(facturaVacia())).toBe(false);
    });
});

describe("con el plugin de expedición es la firma la que cierra la factura", () => {
    beforeEach(activarPlugin);

    test("una emitida todavía se edita", () => {
        expect(editable(conEstado("EMITIDA"))).toBe(true);
    });

    test("un error de firma o un pre Verifactu también", () => {
        expect(editable(conEstado("ERROR_FIRMA"))).toBe(true);
        expect(editable(conEstado("PRE_VERIFACTU"))).toBe(true);
    });

    test("una firmada no", () => {
        expect(editable(conEstado("FIRMADA"))).toBe(false);
    });

    test("sin estado sigue sin editarse", () => {
        expect(editable(facturaVacia())).toBe(false);
    });
});

describe("emitir saca la factura de borrador o reintenta la firma fallida", () => {
    test("se ofrece en BORRADOR", () => {
        expect(facturaEmitible(abierta())).toBe(true);
    });

    test("se ofrece en ERROR_FIRMA como reintento", () => {
        expect(facturaEmitible(conEstado("ERROR_FIRMA"))).toBe(true);
        expect(emisionEsReintento(conEstado("ERROR_FIRMA"))).toBe(true);
        expect(emisionEsReintento(abierta())).toBe(false);
    });

    test("no se ofrece en lo que ya está emitido ni sin estado", () => {
        expect(facturaEmitible(conEstado("EMITIDA"))).toBe(false);
        expect(facturaEmitible(conEstado("FIRMADA"))).toBe(false);
        expect(facturaEmitible(conEstado("PRE_VERIFACTU"))).toBe(false);
        expect(facturaEmitible(facturaVacia())).toBe(false);
    });

    test("el plugin no cambia a quién se puede emitir", () => {
        activarPlugin();
        expect(facturaEmitible(conEstado("EMITIDA"))).toBe(false);
    });
});

describe("estados de expedición que llegan del servidor", () => {
    test("se normalizan a los códigos del dominio", () => {
        expect(estadoExpedicionDesdeApi("Borrador")).toBe("BORRADOR");
        expect(estadoExpedicionDesdeApi("Emitida")).toBe("EMITIDA");
        expect(estadoExpedicionDesdeApi("Firmado")).toBe("FIRMADA");
        expect(estadoExpedicionDesdeApi("Error Firma")).toBe("ERROR_FIRMA");
        expect(estadoExpedicionDesdeApi("PRE_Verifactu")).toBe("PRE_VERIFACTU");
    });

    test("pendiente de firma se colapsa en emitida", () => {
        expect(estadoExpedicionDesdeApi("Pte.Firma")).toBe("EMITIDA");
        expect(estadoExpedicionDesdeApi("PTE_FIRMA")).toBe("EMITIDA");
    });

    test("lo que no se reconoce se queda sin estado", () => {
        expect(estadoExpedicionDesdeApi("")).toBe("");
        expect(estadoExpedicionDesdeApi(null)).toBe("");
        expect(estadoExpedicionDesdeApi("EXPEDIDA")).toBe("");
    });
});

describe("campos que no se tocan a mano ni en una factura abierta", () => {
    const campoEditable = modeloEsEditable(metaFactura);

    test("divisa, tasa, agente y comisión solo cambian por su modal", () => {
        expect(campoEditable(abierta(), "divisa_id")).toBe(false);
        expect(campoEditable(abierta(), "tasa_conversion")).toBe(false);
        expect(campoEditable(abierta(), "agente_id")).toBe(false);
        expect(campoEditable(abierta(), "por_comision")).toBe(false);
    });

    test("fecha, hora y las marcas de automática y servicios sí se editan", () => {
        expect(campoEditable(abierta(), "fecha")).toBe(true);
        expect(campoEditable(abierta(), "hora")).toBe(true);
        expect(campoEditable(abierta(), "automatica")).toBe(true);
        expect(campoEditable(abierta(), "servicios")).toBe(true);
    });

    test("una factura cerrada bloquea todo", () => {
        const cerrada = facturaVacia();
        expect(campoEditable(cerrada, "fecha")).toBe(false);
        expect(campoEditable(cerrada, "hora")).toBe(false);
        expect(campoEditable(cerrada, "automatica")).toBe(false);
    });
});
