/** Idioma preferido del usuario (`usuarios.idioma` en el servidor; sin elegir = español). */
export type Idioma = "es" | "en";

/**
 * La cuenta del usuario autenticado. Nombre y email solo se leen (los cambia un
 * administrador en Usuarios); el usuario solo cambia su idioma.
 */
export interface MiCuenta {
    id: string;
    nombre: string;
    email: string | null;
    idioma: Idioma;
}

export type GetMiCuenta = () => Promise<MiCuenta>;

export type PatchMiCuenta = (miCuenta: MiCuenta) => Promise<void>;
