import { MenuUsuarioElementos } from "@olula/componentes/menu/menu-usuario.tsx";
import { elementoMiCuenta } from "@olula/componentes/menu/mi_cuenta.ts";

const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
const nombreUsuario = userData?.user?.user || "Usuario";

export const MenuUsuarioElementosGanso: MenuUsuarioElementos = [
    {
        nombre: "Usuario",
        subelementos: [
            {
                nombre: nombreUsuario,
                url: "#",
                regla: "contexto.recibo_venta",
                icono: "usuario",
            },
            { ...elementoMiCuenta, icono: "usuario" },
        ],
    },
    {
        nombre: "Administración",
        subelementos: [
            {
                nombre: "Usuarios",
                url: "/auth/usuario",
                regla: "contexto.recibo_venta",
                icono: "usuarios",
            },
            {
                nombre: "Grupos",
                url: "/auth/grupo",
                regla: "contexto.recibo_venta",
                icono: "grupo",
            },
        ],
    },
    {
        nombre: "Sesión",
        subelementos: [
            {
                nombre: "Cerrar sesión",
                url: "/logout",
                icono: "cerrar_sesion",
            },
        ],
    },
];
