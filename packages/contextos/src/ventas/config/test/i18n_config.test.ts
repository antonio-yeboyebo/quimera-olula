import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { afterEach, describe, expect, test } from "vitest";
import { opcionesSiNoPreguntar } from "../dominio.ts";

afterEach(async () => {
    await cambiarIdioma("es");
    localStorage.clear();
});

describe("Configuración de ventas en español e inglés", () => {
    test("las opciones Sí/No/Preguntar conservan el valor y traducen la descripción", async () => {
        expect(opcionesSiNoPreguntar()[0]).toEqual({ valor: "Si", descripcion: "Sí" });
        await cambiarIdioma("en");
        expect(opcionesSiNoPreguntar()).toEqual([
            { valor: "Si", descripcion: "Yes" },
            { valor: "No", descripcion: "No" },
            { valor: "Preguntar", descripcion: "Ask" },
        ]);
    });
});
