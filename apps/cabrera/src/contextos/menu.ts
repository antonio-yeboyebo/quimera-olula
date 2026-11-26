import { MenuUsuarioElementos } from "@olula/componentes/menu/menu-usuario.tsx";
import { elementoMiCuenta } from "@olula/componentes/menu/mi_cuenta.ts";

/**
 * Elementos del menú de usuario personalizados para Cabrera
 * Nota: El nombre del usuario se actualiza dinámicamente en el componente
 */
export const MenuUsuarioElementosCabrera: MenuUsuarioElementos = [
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
    // Al mismo nivel que «Usuario» y «Sesión».
    { ...elementoMiCuenta, icono: "usuario" },
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
