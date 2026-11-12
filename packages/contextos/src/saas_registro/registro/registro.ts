import { MetaModelo } from "@olula/lib/dominio.ts";
import { NuevoRegistro } from "../diseño.ts";

export const LONGITUD_MINIMA_CONTRASEÑA = 8;

export const metaNuevoRegistro: MetaModelo<NuevoRegistro> = {
    campos: {
        nombreEmpresa: { requerido: true },
        nif: { requerido: false },
        nombre: { requerido: true },
        email: {
            requerido: true,
            validacion: (r: NuevoRegistro) =>
                /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email.trim()) || "El email no es válido",
        },
        contraseña: {
            requerido: true,
            validacion: (r: NuevoRegistro) =>
                r.contraseña.length >= LONGITUD_MINIMA_CONTRASEÑA
                || `Al menos ${LONGITUD_MINIMA_CONTRASEÑA} caracteres`,
        },
        repetirContraseña: {
            requerido: true,
            validacion: (r: NuevoRegistro) =>
                r.repetirContraseña === r.contraseña || "Las contraseñas no coinciden",
        },
    },
};

export const nuevoRegistroInicial = (): NuevoRegistro => ({
    nombreEmpresa: "",
    nif: "",
    nombre: "",
    email: "",
    contraseña: "",
    repetirContraseña: "",
});
