import { EstadoRegistro, GetEstadoRegistro, NuevoRegistro, PostRegistro, PostVerificar } from "./diseño.ts";

/**
 * El registro público vive en el backoffice del SaaS (olula_saas_admin), no en la
 * API del ERP, y no lleva sesión: por eso usa fetch directo y no RestAPI.
 */
const BASE = (import.meta.env.VITE_API_SAAS_ADMIN_URL || "http://localhost:5001").replace(/\/+$/, "");

export class ErrorRegistro extends Error {
    constructor(mensaje: string, public estado: number) {
        super(mensaje);
    }
}

const llamar = async <T>(ruta: string, init?: RequestInit): Promise<T> => {
    const respuesta = await fetch(`${BASE}${ruta}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    if (!respuesta.ok) {
        const texto = await respuesta.text();
        const mensaje = respuesta.status === 429
            ? "Demasiados intentos. Espera un rato antes de volver a probar."
            : texto || "No se ha podido completar el registro";
        throw new ErrorRegistro(mensaje, respuesta.status);
    }
    return await respuesta.json() as T;
};

interface RegistroApi {
    nombre_empresa: string;
    nif: string | null;
    nombre: string;
    email: string;
    contraseña: string;
    captcha: string | null;
}

export const registroAApi = (r: NuevoRegistro, captcha: string | null): RegistroApi => ({
    nombre_empresa: r.nombreEmpresa.trim(),
    nif: r.nif.trim() || null,
    nombre: r.nombre.trim(),
    email: r.email.trim(),
    contraseña: r.contraseña,
    captcha,
});

export const postRegistro: PostRegistro = async (registro, captcha) =>
    await llamar("/public/saas/registro", {
        method: "POST",
        body: JSON.stringify(registroAApi(registro, captcha)),
    });

export const postVerificar: PostVerificar = async (token) =>
    await llamar<EstadoRegistro>("/public/saas/registro/verificar", {
        method: "POST",
        body: JSON.stringify({ token }),
    });

export const getEstadoRegistro: GetEstadoRegistro = async (token) =>
    await llamar<EstadoRegistro>(`/public/saas/registro/estado?token=${encodeURIComponent(token)}`);
