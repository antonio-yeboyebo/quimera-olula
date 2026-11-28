import { ElementoMenuHijo } from "@olula/lib/menu.ts";

/**
 * "Mi cuenta" del menú del usuario: los datos del propio usuario y su idioma
 * (ruta `auth/mi_cuenta` de `routerAuth`). Sin regla: lo ve cualquier usuario
 * autenticado. Está en el menú por defecto y las apps con menú propio también
 * lo incluyen.
 */
export const elementoMiCuenta: ElementoMenuHijo = {
  nombre: "Mi cuenta",
  url: "/auth/mi_cuenta",
};
