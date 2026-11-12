import { describe, expect, it } from "vitest";
import { CobroOnline } from "../diseño.ts";
import { conIncidencia, emailValido, enlaceVigente, textoIncidencia, textoReembolsoPasarela, TEXTO_ESTADO } from "../dominio.ts";
import { cobroOnlineDesdeApi, enlacePagoDesdeApi, reembolsoPasarelaDesdeApi } from "../infraestructura.ts";

const cobro = (datos: Partial<CobroOnline> = {}): CobroOnline => ({
    id: "c1", url: "https://olula.test/public/pagos/t1", estado: "pendiente", importe: 121.5,
    importeReembolsado: null, divisaId: "EUR", modo: "test", incidencia: null,
    creadoEn: "2026-11-06T10:00:00", pagadoEn: null, urlPanel: null, ...datos,
});

describe("cobros con tarjeta", () => {
    it("el enlace vigente es el pendiente con url", () => {
        const pagado = cobro({ id: "c0", estado: "pagado" });
        expect(enlaceVigente([pagado, cobro()])?.id).toBe("c1");
        expect(enlaceVigente([pagado])).toBeNull();
        expect(enlaceVigente([cobro({ url: null })])).toBeNull();
    });

    it("explica cada incidencia del webhook y no se calla las desconocidas", () => {
        expect(textoIncidencia("importe_distinto")).toMatch(/no coincide/);
        expect(textoIncidencia("cuenta_no_configurada")).toMatch(/cuenta/);
        expect(textoIncidencia("otra")).toBe("Incidencia: otra");
        expect(conIncidencia([cobro(), cobro({ id: "c2", incidencia: "disputa" })]).map((c) => c.id)).toEqual(["c2"]);
    });

    it("tiene texto para cada estado", () => {
        expect(Object.keys(TEXTO_ESTADO).sort()).toEqual(
            ["caducado", "cancelado", "pagado", "pendiente", "reembolsado"]);
    });

    it("valida el email antes de enviar", () => {
        expect(emailValido(" cliente@acme.es ")).toBe(true);
        expect(emailValido("cliente@acme")).toBe(false);
        expect(emailValido("")).toBe(false);
    });

    it("convierte las respuestas de la API", () => {
        expect(enlacePagoDesdeApi({
            id: "c1", url: "u", estado: "pendiente", importe: "121.50", divisa_id: "EUR", modo: "live", enviado_a: null,
        })).toEqual({ id: "c1", url: "u", estado: "pendiente", importe: 121.5, divisaId: "EUR", modo: "live", enviadoA: null });
        expect(cobroOnlineDesdeApi({
            id: "c1", url: null, estado: "pagado", importe: 10, importe_reembolsado: null, divisa_id: "EUR",
            modo: "test", incidencia: "reembolso", creado_en: "2026-11-06T10:00:00", pagado_en: "2026-11-06T11:00:00",
        }).incidencia).toBe("reembolso");
        expect(cobroOnlineDesdeApi({
            id: "c1", url: null, estado: "pagado", importe: 10, importe_reembolsado: null, divisa_id: "EUR",
            modo: "test", incidencia: null, creado_en: "2026-11-06T10:00:00", pagado_en: "2026-11-06T11:00:00",
            url_panel: "https://dashboard.stripe.com/test/payments/pi_1",
        }).urlPanel).toBe("https://dashboard.stripe.com/test/payments/pi_1");
    });
});

describe("reembolso en Stripe al devolver un recibo", () => {
    it("convierte la respuesta de la API, que es null si no se puede", () => {
        expect(reembolsoPasarelaDesdeApi(null)).toBeNull();
        expect(reembolsoPasarelaDesdeApi({
            cobro_id: "c1", importe: "121.50", divisa_id: "EUR", modo: "test", total: true,
        })).toEqual({ cobroId: "c1", importe: 121.5, divisaId: "EUR", modo: "test", total: true });
    });

    it("explica qué se va a reembolsar", () => {
        const base = { cobroId: "c1", importe: 121.5, divisaId: "EUR", modo: "live" as const, total: true };
        expect(textoReembolsoPasarela(base)).toMatch(/^Reembolsar también .* en Stripe$/);
        expect(textoReembolsoPasarela({ ...base, modo: "test" })).toContain("(modo test)");
        expect(textoReembolsoPasarela({ ...base, total: false })).toContain("cobro con tarjeta de la factura");
    });
});

describe("QR del TPV", () => {
    it("convierte la respuesta de la API", async () => {
        const { cobroQrDesdeApi } = await import("../infraestructura.ts");
        expect(cobroQrDesdeApi({
            id: "c1", url: "https://pago.test/cs_1", estado: "pendiente", importe: "12.50",
            divisa_id: "EUR", modo: "test",
        })).toEqual({
            id: "c1", url: "https://pago.test/cs_1", estado: "pendiente", importe: 12.5,
            divisaId: "EUR", modo: "test", incidencia: null,
        });
    });
});
