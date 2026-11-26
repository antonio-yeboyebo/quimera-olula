import type { Traduccion } from "@olula/lib/i18n/i18n.ts";
import type { es } from "./es.ts";

export const en: Traduccion<typeof es> = {
    miCuenta: {
        titulo: "My account",
        descripcion: "Your user details and preferences.",
        datos: "User details",
        nombre: "Name",
        email: "Email",
        preferencias: "Preferences",
        idioma: "Language",
        idiomas: { es: "Spanish", en: "English" },
        errorGuardar: "Error saving your account",
    },
};
