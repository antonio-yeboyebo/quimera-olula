import { Registro } from "./registro/Registro.tsx";
import { VerificarRegistro } from "./verificar/VerificarRegistro.tsx";

/**
 * Rutas públicas del registro. No van dentro del layout autenticado: la app las
 * monta como rutas de primer nivel (ver apps/olula_saas/src/main.tsx).
 */
export const rutasRegistroSaas = [
    { path: "/registro", Component: Registro },
    { path: "/registro/verificar", Component: VerificarRegistro },
];

export const RUTAS_PUBLICAS_REGISTRO = ["/registro", "/registro/verificar"];
