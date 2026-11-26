import "./menu-usuario.css";

import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { puedeAlguna } from "@olula/lib/dominio.ts";
import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { ElementoMenu, ElementoMenuPadre } from "@olula/lib/menu.ts";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { QAvatar } from "../atomos/qavatar.tsx";
import { QIcono } from "../atomos/qicono.tsx";
import { estaAutentificado } from "../plantilla/autenticacion";
import { useMenuControl } from "../plantilla/useMenuControl";
import { elementoMiCuenta } from "./mi_cuenta.ts";

// Tipo exportado para que las apps puedan usarlo en sus factories
export type MenuUsuarioElementos = ElementoMenu[];

// Función opcional para procesar elementos antes de renderizarlos
export type ProcesoElementosFn = (
  elementos: MenuUsuarioElementos
) => MenuUsuarioElementos;

// Elementos por defecto si la app no proporciona los suyos: debajo del usuario
// (avatar y nombre), «Mi cuenta» y «Cerrar sesión», sin secciones.
const elementosDelMenuDefault: MenuUsuarioElementos = [
  elementoMiCuenta,
  {
    nombre: "Cerrar sesión",
    url: "/logout",
  },
];

/** Id del usuario conectado (el `usuario_id` del whoami guardado al entrar). */
const usuarioConectado = (): string => {
  try {
    const whoami = JSON.parse(localStorage.getItem("whoami") ?? "{}");
    return typeof whoami?.usuario_id === "string" ? whoami.usuario_id : "";
  } catch {
    return "";
  }
};

const CLAVE_NOMBRE = "nombre-usuario";

/** Nombre del usuario conectado, guardado la última vez que se leyó de «Mi cuenta». */
const nombreGuardado = (usuarioId: string): string => {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_NOMBRE) ?? "{}");
    return guardado?.id === usuarioId && typeof guardado?.nombre === "string" ? guardado.nombre : "";
  } catch {
    return "";
  }
};

/** El nombre del usuario (de `GET /auth/mi_cuenta`); mientras llega, el último conocido o su id. */
const useNombreUsuario = (usuarioId: string): string => {
  const [nombre, setNombre] = useState(() => nombreGuardado(usuarioId));

  useEffect(() => {
    if (!usuarioId) return;
    let vigente = true;
    RestAPI.get<{ datos: { nombre?: string | null } }>("/auth/mi_cuenta")
      .then((respuesta) => {
        const leido = respuesta?.datos?.nombre?.trim();
        if (!vigente || !leido) return;
        setNombre(leido);
        try {
          localStorage.setItem(CLAVE_NOMBRE, JSON.stringify({ id: usuarioId, nombre: leido }));
        } catch {
          // Sin almacenamiento local: solo se pierde el nombre al recargar.
        }
      })
      .catch(() => undefined);
    return () => {
      vigente = false;
    };
  }, [usuarioId]);

  return nombre || usuarioId;
};

export const MenuUsuarioBase = (props: {
  elementos?: MenuUsuarioElementos;
  procesarElementos?: ProcesoElementosFn;
}) => {
  const { menuAbierto, cerrarMenu } = useMenuControl();
  const usuarioId = usuarioConectado();
  const usuario = useNombreUsuario(usuarioId);

  // No mostrar menú si no está autenticado
  if (!estaAutentificado()) {
    return null;
  }

  let elementosDelMenu = props.elementos || elementosDelMenuDefault;

  // Procesar elementos si se proporciona una función
  if (props.procesarElementos) {
    elementosDelMenu = props.procesarElementos(elementosDelMenu);
  }

  const renderizaElemento = (elemento: ElementoMenu) => {
    const icono = elemento.icono ? (
      <QIcono nombre={elemento.icono} tamaño="sm" />
    ) : null;

    if ("regla" in elemento && elemento.regla && !puedeAlguna(elemento.regla)) {
      return null;
    }

    if ("url" in elemento && elemento.url) {
      return (
        <li key={elemento.nombre}>
          <Link to={elemento.url} onClick={() => cerrarMenu("usuario")}>
            {icono} {elemento.nombre}
          </Link>
        </li>
      );
    }

    const subelementos = (elemento as ElementoMenuPadre).subelementos
      .map((subelemento) => renderizaElemento(subelemento))
      .filter(Boolean);
    if (!subelementos.length) return null;

    return (
      <details key={elemento.nombre} open>
        <summary>
          {icono} {elemento.nombre}
        </summary>
        <hr />
        <ul>{subelementos}</ul>
      </details>
    );
  };

  const elementos = elementosDelMenu.map((elemento) =>
    renderizaElemento(elemento)
  );

  return (
    <menu-usuario className={menuAbierto.usuario ? "activo" : ""}>
      <aside id="menu-usuario">
        {usuario && (
          <div className="menu-usuario-cabecera">
            <QAvatar nombre={usuario} tamaño="sm" />
            <span>{usuario}</span>
          </div>
        )}
        <nav>
          <ul>{elementos}</ul>
        </nav>
      </aside>
    </menu-usuario>
  );
};

export const MenuUsuario = () => {
  const { app } = useContext(FactoryCtx);
  const elementos = app.Componentes?.menu_usuario_elementos as
    | MenuUsuarioElementos
    | undefined;
  const procesarElementos = app.Componentes?.menu_usuario_procesar_elementos as
    | ProcesoElementosFn
    | undefined;

  return (
    <MenuUsuarioBase
      elementos={elementos}
      procesarElementos={procesarElementos}
    />
  );
};
