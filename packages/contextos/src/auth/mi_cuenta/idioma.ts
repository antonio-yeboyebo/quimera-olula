import { tokenAcceso } from "@olula/lib/api/token_acceso.ts";
import { cambiarIdioma } from "@olula/lib/i18n/i18n.ts";
import { tokenRefresco } from "../login/infraestructura.ts";
import { getMiCuenta } from "./infraestructura.ts";

/** Sesión (token) cuyo idioma ya se ha leído: una lectura por sesión y carga de página. */
let sesionSincronizada: string | null = null;

/**
 * Pone la interfaz en el idioma de «Mi cuenta» del usuario (sin idioma, español). Se llama al
 * entrar en cualquier ruta privada: lee `GET /auth/mi_cuenta` una vez por sesión (al cambiar de
 * usuario se vuelve a leer). Si falla, se queda el idioma guardado en el navegador.
 */
export const sincronizarIdiomaUsuario = async (): Promise<void> => {
    const sesion = tokenRefresco.obtener() ?? tokenAcceso.obtener();
    if (!sesion || sesion === sesionSincronizada) return;
    sesionSincronizada = sesion;
    try {
        const cuenta = await getMiCuenta();
        await cambiarIdioma(cuenta.idioma);
    } catch {
        sesionSincronizada = null;
    }
};

/** Para los tests: olvida la sesión sincronizada. */
export const olvidarIdiomaSincronizado = () => {
    sesionSincronizada = null;
};
