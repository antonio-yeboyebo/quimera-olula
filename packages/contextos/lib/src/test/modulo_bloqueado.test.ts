import { afterEach, describe, expect, it } from "vitest";
import { moduloBloqueado, puede } from "../dominio.ts";

const conWhoAmI = (whoami: unknown) => localStorage.setItem("whoami", JSON.stringify(whoami));

describe("moduloBloqueado (SaaS)", () => {
    afterEach(() => localStorage.clear());

    it("fuera del SaaS no bloquea nada", () => {
        conWhoAmI({ plugins: {} });
        expect(moduloBloqueado("crm.contacto")).toBe(false);
    });

    it("bloquea las reglas de los prefijos de módulos no contratados", () => {
        conWhoAmI({ saas: { modulos_bloqueados: ["crm", "comun.ia"] } });
        expect(moduloBloqueado("crm")).toBe(true);
        expect(moduloBloqueado("crm.contacto")).toBe(true);
        expect(moduloBloqueado("comun.ia.hilo")).toBe(true);
        expect(moduloBloqueado("comun.iatrogenia")).toBe(false);
        expect(moduloBloqueado("ventas.factura")).toBe(false);
    });

    it("puede() deniega aunque el grupo tenga permiso", () => {
        conWhoAmI({ saas: { modulos_bloqueados: ["crm"] } });
        expect(puede("crm.contacto")).toBe(false);
        expect(puede("ventas.factura")).toBe(true);
    });
});
