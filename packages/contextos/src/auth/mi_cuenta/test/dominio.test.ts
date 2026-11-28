import { idiomaDesde, idiomaPorDefecto, opcionesIdioma } from "#/auth/mi_cuenta/dominio.ts";
import { miCuentaAApi, miCuentaDesdeApi } from "#/auth/mi_cuenta/infraestructura.ts";
import { describe, expect, test } from "vitest";

const api = { id: "validador", nombre: "Validador", email: "validador@local.test", idioma: "en" };

describe("mi cuenta", () => {
    test("por defecto el idioma es español", () => {
        expect(idiomaPorDefecto).toBe("es");
    });

    test("el combo ofrece Español e Inglés, en ese orden", () => {
        expect(opcionesIdioma()).toEqual([
            { valor: "es", descripcion: "Español" },
            { valor: "en", descripcion: "Inglés" },
        ]);
    });

    test("un idioma sin elegir o desconocido es español", () => {
        expect(idiomaDesde(null)).toBe("es");
        expect(idiomaDesde("fr")).toBe("es");
        expect(idiomaDesde("en")).toBe("en");
    });

    test("viene de la API", () => {
        expect(miCuentaDesdeApi(api)).toEqual(
            { id: "validador", nombre: "Validador", email: "validador@local.test", idioma: "en" });
        expect(miCuentaDesdeApi({ ...api, idioma: null }).idioma).toBe("es");
    });

    test("al guardar solo se manda el idioma, nunca nombre ni email", () => {
        expect(miCuentaAApi(miCuentaDesdeApi(api))).toEqual({ idioma: "en" });
    });
});

describe("mi cuenta en inglés", () => {
    test("el combo nombra los idiomas en el idioma activo", async () => {
        const { cambiarIdioma } = await import("@olula/lib/i18n/i18n.ts");
        await cambiarIdioma("en");
        expect(opcionesIdioma().map((opcion) => opcion.descripcion)).toEqual(["Spanish", "English"]);
        await cambiarIdioma("es");
    });
});
