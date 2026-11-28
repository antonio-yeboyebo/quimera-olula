import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { RestAPI } from "../api/rest_api.ts";
import { validacionCampoModelo } from "../dominio.ts";
import { cambiarIdioma, idiomaActual, idiomaDesde, localeActual, registrarTraducciones } from "../i18n/i18n.ts";

const es = {
    saludo: "Hola {{nombre}}",
    grupo: { boton: "Guardar", solo_es: "Sólo en español" },
    filas_one: "{{count}} fila",
    filas_other: "{{count}} filas",
} as const;

const prueba = registrarTraducciones("prueba", {
    es,
    en: {
        saludo: "Hello {{nombre}}",
        // Una traducción que falte sale en español (aquí se fuerza a mano).
        grupo: { boton: "Save", solo_es: undefined as unknown as string },
        filas_one: "{{count}} row",
        filas_other: "{{count}} rows",
    },
});

afterEach(async () => {
    await act(() => cambiarIdioma("es"));
    vi.unstubAllGlobals();
});

describe("i18n", () => {
    test("sin idioma elegido es español", () => {
        expect(idiomaActual()).toBe("es");
        expect(idiomaDesde(null)).toBe("es");
        expect(idiomaDesde("fr")).toBe("es");
        expect(idiomaDesde("en")).toBe("en");
    });

    test("traduce con parámetros y plurales en el idioma activo", async () => {
        expect(prueba.t("saludo", { nombre: "Ana" })).toBe("Hola Ana");
        expect(prueba.t("filas", { count: 1 })).toBe("1 fila");
        expect(prueba.t("filas", { count: 3 })).toBe("3 filas");

        await cambiarIdioma("en");

        expect(prueba.t("saludo", { nombre: "Ana" })).toBe("Hello Ana");
        expect(prueba.t("grupo.boton")).toBe("Save");
        expect(prueba.t("filas", { count: 3 })).toBe("3 rows");
        expect(localeActual()).toBe("en-GB");
    });

    test("lo que falta en inglés sale en español", async () => {
        await cambiarIdioma("en");
        expect(prueba.t("grupo.solo_es")).toBe("Sólo en español");
    });

    test("cambiarIdioma lo recuerda en el navegador y en <html lang>", async () => {
        await cambiarIdioma("en");
        expect(localStorage.getItem("olula.idioma")).toBe("en");
        expect(document.documentElement.lang).toBe("en");
    });

    test("useT repinta el componente al cambiar el idioma, sin recargar", async () => {
        const Boton = () => {
            const t = prueba.useT();
            return <button>{t("grupo.boton")}</button>;
        };
        render(<Boton />);
        expect(screen.getByRole("button")).toHaveTextContent("Guardar");

        await act(() => cambiarIdioma("en"));

        expect(screen.getByRole("button")).toHaveTextContent("Save");
    });

    test("las validaciones de los modelos salen en el idioma activo", async () => {
        const validar = validacionCampoModelo<{ nombre: string }>({ campos: { nombre: { requerido: true } } });
        expect(validar({ nombre: "" }, "nombre")).toBe("Campo requerido");
        await cambiarIdioma("en");
        expect(validar({ nombre: "" }, "nombre")).toBe("Required field");
    });

    test("RestAPI manda Accept-Language con el idioma activo", async () => {
        const fetch = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ datos: [] }), { status: 200 }));
        vi.stubGlobal("fetch", fetch);

        await RestAPI.get("/x");
        await cambiarIdioma("en");
        await RestAPI.get("/x");

        const cabeceras = fetch.mock.calls.map(([, init]) => (init as RequestInit).headers as Record<string, string>);
        expect(cabeceras[0]["Accept-Language"]).toBe("es");
        expect(cabeceras[1]["Accept-Language"]).toBe("en");
    });

    test("un error HTTP sin mensaje propio se titula en el idioma activo", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Client 7 does not exist", { status: 404 })));
        await cambiarIdioma("en");

        await expect(RestAPI.get("/x")).rejects.toEqual(
            { nombre: "Error 404", descripcion: "Client 7 does not exist", estado: 404 });
    });
});
