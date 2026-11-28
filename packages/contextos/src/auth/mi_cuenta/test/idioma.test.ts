import { cambiarIdioma, idiomaActual } from "@olula/lib/i18n/i18n.ts";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const getMiCuenta = vi.fn();

vi.mock("../infraestructura.ts", async (original) => ({
    ...(await original<typeof import("../infraestructura.ts")>()),
    getMiCuenta: () => getMiCuenta(),
}));

const { olvidarIdiomaSincronizado, sincronizarIdiomaUsuario } = await import("../idioma.ts");
const { guardarMiCuenta } = await import("../infraestructura.ts");

const cuenta = (idioma: "es" | "en") => ({ id: "validador", nombre: "Validador", email: null, idioma });

beforeEach(() => {
    localStorage.setItem("token-refresco", "sesion-1");
    olvidarIdiomaSincronizado();
});

afterEach(async () => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
    await cambiarIdioma("es");
});

describe("idioma del usuario", () => {
    test("al entrar se pone el idioma de Mi cuenta", async () => {
        getMiCuenta.mockResolvedValue(cuenta("en"));
        await sincronizarIdiomaUsuario();
        expect(idiomaActual()).toBe("en");
        expect(localStorage.getItem("olula.idioma")).toBe("en");
    });

    test("se lee una vez por sesión y otra vez si cambia de usuario", async () => {
        getMiCuenta.mockResolvedValue(cuenta("es"));
        await sincronizarIdiomaUsuario();
        await sincronizarIdiomaUsuario();
        expect(getMiCuenta).toHaveBeenCalledTimes(1);

        localStorage.setItem("token-refresco", "sesion-2");
        await sincronizarIdiomaUsuario();
        expect(getMiCuenta).toHaveBeenCalledTimes(2);
    });

    test("sin sesión no se pregunta al servidor", async () => {
        localStorage.clear();
        await sincronizarIdiomaUsuario();
        expect(getMiCuenta).not.toHaveBeenCalled();
    });

    test("si el servidor falla se queda el idioma guardado y se reintenta en la siguiente ruta", async () => {
        await cambiarIdioma("en");
        getMiCuenta.mockRejectedValueOnce(new Error("caído")).mockResolvedValueOnce(cuenta("es"));
        await sincronizarIdiomaUsuario();
        expect(idiomaActual()).toBe("en");
        await sincronizarIdiomaUsuario();
        expect(idiomaActual()).toBe("es");
    });

    test("al guardar Mi cuenta la interfaz cambia de idioma sin recargar", async () => {
        const fetch = vi.fn().mockImplementation(async () => new Response("{}", { status: 200 }));
        vi.stubGlobal("fetch", fetch);
        await guardarMiCuenta(cuenta("en"));
        expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ idioma: "en" });
        expect(idiomaActual()).toBe("en");
    });

    test("si el servidor no acepta el cambio, el idioma no cambia", async () => {
        vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response("no", { status: 400 })));
        await expect(guardarMiCuenta(cuenta("en"))).rejects.toBeTruthy();
        expect(idiomaActual()).toBe("es");
    });
});
