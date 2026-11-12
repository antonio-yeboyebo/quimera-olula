import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevaContrasena } from "../diseño.js";

export const nuevaContrasenaVacia: NuevaContrasena = { contrasena: "" };

export const metaNuevaContrasena: MetaModelo<NuevaContrasena> = {
    campos: {
        contrasena: { requerido: true, validacion: (m) => m.contrasena.trim().length > 0 },
    },
};
