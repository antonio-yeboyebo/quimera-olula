import { describe, expect, it } from "vitest";
import {
    OTRO_PROVEEDOR,
    buscarProveedorConocido,
    iconoProveedor,
    opcionesProveedorPorCategoria,
    proveedoresPorCategoria,
    secretoCompleto,
    secretoConCambios,
} from "../dominio.js";

describe("buscarProveedorConocido", () => {
    it("encuentra un proveedor conocido por su valor exacto", () => {
        expect(buscarProveedorConocido("Telegram")?.tipoAuth).toBe("api_key");
        expect(buscarProveedorConocido("Google Drive")?.tipoAuth).toBe("oauth2");
        expect(buscarProveedorConocido("Google Calendar")?.tipoAuth).toBe("oauth2");
        expect(buscarProveedorConocido("Correo (IMAP/SMTP)")?.tipoAuth).toBe("basic");
        expect(buscarProveedorConocido("Gemini")?.tipoAuth).toBe("api_key");
    });

    it("no encuentra nada para un proveedor libre ('Otro')", () => {
        expect(buscarProveedorConocido(OTRO_PROVEEDOR)).toBeUndefined();
        expect(buscarProveedorConocido("Cualquier cosa")).toBeUndefined();
    });
});

describe("categorías de proveedor", () => {
    it("los proveedores LLM soportados son Gemini, OpenAI, Anthropic, Mistral, Azure OpenAI y Ollama", () => {
        const llm = proveedoresPorCategoria("llm");
        expect(llm.map((p) => p.valor)).toEqual([
            "Gemini", "OpenAI", "Anthropic", "Mistral", "Azure OpenAI", "Ollama",
        ]);
    });

    it("Telegram/Google Drive/Google Calendar/Correo/Stripe son 'conector'", () => {
        const conectores = proveedoresPorCategoria("conector").map((p) => p.valor);
        expect(conectores).toEqual(["Telegram", "Google Drive", "Google Calendar", "Correo (IMAP/SMTP)", "Stripe"]);
    });

    it("'Otro' solo aparece como opción para conectores, nunca para LLM", () => {
        const opcionesLlm = opcionesProveedorPorCategoria("llm").map((o) => o.valor);
        const opcionesConector = opcionesProveedorPorCategoria("conector").map((o) => o.valor);
        expect(opcionesLlm).not.toContain(OTRO_PROVEEDOR);
        expect(opcionesConector).toContain(OTRO_PROVEEDOR);
    });

    it("iconoProveedor cae a un icono genérico para proveedores desconocidos", () => {
        expect(iconoProveedor("Telegram")).toBe("telegram");
        expect(iconoProveedor("Proveedor inventado")).toBe("ajustes");
    });
});

describe("secretoCompleto", () => {
    it("para un proveedor conocido exige sus propios campos, no los genéricos de tipoAuth", () => {
        expect(secretoCompleto("Telegram", "api_key", {})).toBe(false);
        expect(secretoCompleto("Telegram", "api_key", { api_key: "no-es-este-campo" })).toBe(false);
        expect(secretoCompleto("Telegram", "api_key", { bot_token: "123:abc" })).toBe(false);
        expect(
            secretoCompleto("Telegram", "api_key", { bot_token: "123:abc", chat_id_autorizado: "999" })
        ).toBe(true);
    });

    it("Gemini exige api_key pero no el modelo (opcional)", () => {
        expect(secretoCompleto("Gemini", "api_key", {})).toBe(false);
        expect(secretoCompleto("Gemini", "api_key", { api_key: "x" })).toBe(true);
    });

    it("OpenAI/Anthropic/Mistral exigen api_key pero no el modelo (opcional)", () => {
        for (const proveedor of ["OpenAI", "Anthropic", "Mistral"]) {
            expect(secretoCompleto(proveedor, "api_key", {})).toBe(false);
            expect(secretoCompleto(proveedor, "api_key", { api_key: "x" })).toBe(true);
        }
    });

    it("Azure OpenAI exige api_key, endpoint y despliegue, pero no la versión de API (opcional)", () => {
        const sinVersion = { api_key: "x", endpoint: "https://r.openai.azure.com", despliegue: "mi-gpt" };
        expect(secretoCompleto("Azure OpenAI", "api_key", sinVersion)).toBe(true);
        expect(secretoCompleto("Azure OpenAI", "api_key", { api_key: "x" })).toBe(false);
    });

    it("Ollama exige base_url y modelo, ninguno es opcional (sin api_key)", () => {
        expect(secretoCompleto("Ollama", "api_key", { base_url: "http://localhost:11434" })).toBe(false);
        expect(
            secretoCompleto("Ollama", "api_key", { base_url: "http://localhost:11434", modelo: "llama3.1" })
        ).toBe(true);
    });

    it("Google Drive/Calendar exigen client_id y client_secret (el token lo obtiene el flujo OAuth)", () => {
        expect(secretoCompleto("Google Drive", "oauth2", { client_id: "a" })).toBe(false);
        expect(secretoCompleto("Google Drive", "oauth2", { client_id: "a", client_secret: "b" })).toBe(true);
    });

    it("Stripe exige el modo, la cuenta de cobros y la clave secreta de test; las de live son opcionales", () => {
        const completo = { modo: "test", cuenta_banco_id: "0099", secret_key_test: "sk_test_x" };
        expect(secretoCompleto("Stripe", "api_key", completo)).toBe(true);
        expect(secretoCompleto("Stripe", "api_key", { ...completo, modo: "" })).toBe(false);
        expect(secretoCompleto("Stripe", "api_key", { ...completo, cuenta_banco_id: "" })).toBe(false);
        expect(secretoCompleto("Stripe", "api_key", { ...completo, secret_key_test: "" })).toBe(false);
    });

    it("la cuenta de cobros de Stripe es un desplegable de cuentas bancarias", () => {
        const cuenta = buscarProveedorConocido("Stripe")?.campos.find((c) => c.clave === "cuenta_banco_id");
        expect(cuenta?.tipo).toBe("cuenta_bancaria");
    });

    it("el modo de Stripe es un desplegable test/live", () => {
        const modo = buscarProveedorConocido("Stripe")?.campos.find((c) => c.clave === "modo");
        expect(modo?.opciones?.map((o) => o.valor)).toEqual(["test", "live"]);
        expect(secretoCompleto("Google Calendar", "oauth2", { client_id: "a", client_secret: "b" })).toBe(true);
    });

    it("Correo (IMAP/SMTP) exige credenciales y ambos servidores", () => {
        const completo = {
            usuario: "a@b.com",
            password: "x",
            imap_host: "imap.b.com",
            imap_puerto: "993",
            smtp_host: "smtp.b.com",
            smtp_puerto: "587",
        };
        expect(secretoCompleto("Correo (IMAP/SMTP)", "basic", completo)).toBe(true);
        const { smtp_host: _smtp_host, ...incompleto } = completo;
        expect(secretoCompleto("Correo (IMAP/SMTP)", "basic", incompleto)).toBe(false);
    });

    it("para 'Otro' cae en los campos genéricos por tipoAuth", () => {
        expect(secretoCompleto(OTRO_PROVEEDOR, "api_key", { api_key: "x" })).toBe(true);
        expect(secretoCompleto(OTRO_PROVEEDOR, "bearer", { token: "x" })).toBe(true);
        expect(secretoCompleto(OTRO_PROVEEDOR, "basic", { usuario: "a" })).toBe(false);
        expect(secretoCompleto(OTRO_PROVEEDOR, "oauth2", { client_id: "a", client_secret: "b" })).toBe(true);
    });
});

describe("secretoConCambios", () => {
    it("es falso con el formulario vacío", () => {
        expect(secretoConCambios({})).toBe(false);
    });

    it("es falso si todos los campos rellenados están en blanco", () => {
        expect(secretoConCambios({ api_key: "", modelo: "" })).toBe(false);
    });

    it("es verdadero si al menos un campo trae valor, sin exigir el resto", () => {
        // Solo el "modelo" — no hace falta volver a teclear la api_key: el
        // backend conserva la ya guardada (ver caso_de_uso.py del servidor).
        expect(secretoConCambios({ api_key: "", modelo: "gpt-4.1" })).toBe(true);
    });

    it("es verdadero con el secreto completo, igual que para el alta", () => {
        expect(secretoConCambios({ api_key: "x", modelo: "gpt-4.1" })).toBe(true);
    });
});
