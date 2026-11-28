import { MenuUsuarioElementos } from "@olula/componentes/menu/menu-usuario.tsx";
import { elementoMiCuenta } from "@olula/componentes/menu/mi_cuenta.ts";

/**
 * Elementos del menú de usuario personalizados para Sanhigia
 * Nota: El nombre del usuario se actualiza dinámicamente en el componente
 */
export const MenuUsuarioElementosSanhigia: MenuUsuarioElementos = [
    {
        nombre: "Usuario",
        subelementos: [
            {
                nombre: "Mi usuario",
                icono: "usuario",
                url: "/user",
                color: "success",
                variant: "main",
            },
        ],
    },
    // Al mismo nivel que las demás secciones.
    { ...elementoMiCuenta, icono: "usuario" },
    {
        nombre: "Administración",
        subelementos: [
            {
                nombre: "Usuarios",
                icono: "lista",
                url: "/auth/usuario",
                regla: "auth.usuario.leer",
            },
            {
                nombre: "Grupos",
                icono: "grupo",
                url: "/auth/grupo",
                regla: "auth.grupo.leer",
            },
        ],
    },
    {
        nombre: "Sesión",
        subelementos: [
            {
                nombre: "Desconectar",
                icono: "cerrar_sesion",
                url: "/logout",
            },
        ],
    },
];
