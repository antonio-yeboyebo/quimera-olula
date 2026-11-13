import { authMiddleware } from "#/auth/middlewares.ts";
import { RUTAS_PUBLICAS_REGISTRO } from "#/saas_registro/router_factory.ts";
import { moduloBloqueadoEnUrl } from "@olula/lib/dominio.ts";
import { MiddlewareFunction, redirect } from "react-router";

/**
 * El de auth, dejando pasar sin sesión las páginas públicas del registro. Una URL
 * de un módulo no contratado (escrita a mano o de un marcador) vuelve al inicio:
 * el menú ya no la ofrece y la API la rechazaría con 403.
 */
export const authMiddlewareSaas: MiddlewareFunction = async (args, next) => {
    const ruta = new URL(args.request.url).pathname;
    if (RUTAS_PUBLICAS_REGISTRO.includes(ruta)) return await next();
    if (moduloBloqueadoEnUrl(ruta)) throw redirect("/");
    return await authMiddleware(args, next);
};
