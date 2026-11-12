import { Modelo } from "@olula/lib/diseño.ts";

/** Alta pública de una empresa en Olula SaaS. */
export interface NuevoRegistro extends Modelo {
    nombreEmpresa: string;
    nif: string;
    nombre: string;
    email: string;
    contraseña: string;
    repetirContraseña: string;
}

export type EstadoEmpresaRegistrada =
    | "pendiente_verificacion" | "provisionando" | "activo" | "suspendido" | "baja" | "error";

export interface ResultadoRegistro {
    empresa: string;
    email: string;
}

export interface EstadoRegistro {
    empresa: string;
    estado: EstadoEmpresaRegistrada;
    email?: string;
}

export type PostRegistro = (registro: NuevoRegistro, captcha: string | null) => Promise<ResultadoRegistro>;
export type PostVerificar = (token: string) => Promise<EstadoRegistro>;
export type GetEstadoRegistro = (token: string) => Promise<EstadoRegistro>;
