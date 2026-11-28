import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { afterEach, describe, expect, test } from "vitest";
import { textoTramo } from "../dominio.ts";

afterEach(async () => {
    await cambiarIdioma("es");
    localStorage.clear();
});

describe("Precios por artículo en español e inglés", () => {
    test("tramos de cantidad", async () => {
        expect(textoTramo({ cantidadMin: 0, cantidadMax: 0 })).toBe("Todas");
        await cambiarIdioma("en");
        expect(textoTramo({ cantidadMin: 0, cantidadMax: 0 })).toBe("All");
        expect(textoTramo({ cantidadMin: 10, cantidadMax: 0 })).toBe("From 10");
        expect(textoTramo({ cantidadMin: 0, cantidadMax: 9 })).toBe("Up to 9");
    });
});
