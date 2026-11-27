import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { QBoton } from "../atomos/qboton.tsx";
import { QIcono } from "../atomos/qicono.tsx";
import "./MenuAccionesMovil.css";
import { SelectorModo } from "./SelectorModo.tsx";
import { ModoCalendario } from "./tipos.ts";
import { useTComponentes } from "../i18n/textos.ts";

interface MenuAccionesMovilProps {
  modoAnio: boolean;
  modos?: ModoCalendario[];
  onCambioModo: () => void;
  onCambioModoVista?: (modo: ModoCalendario) => void;
  botonesIzqModo?: React.ReactNode[];
  botonesDerModo?: React.ReactNode[];
  botonesIzqHoy?: React.ReactNode[];
  botonesDerHoy?: React.ReactNode[];
  mostrarCambioModo?: boolean;
  playground?: boolean;
  onAbrirPlayground?: () => void;
}

export function MenuAccionesMovil({
  modoAnio,
  modos,
  onCambioModo,
  onCambioModoVista,
  botonesIzqModo = [],
  botonesDerModo = [],
  botonesIzqHoy = [],
  botonesDerHoy = [],
  mostrarCambioModo = true,
  playground,
  onAbrirPlayground,
}: MenuAccionesMovilProps) {
  const t = useTComponentes();
  const [abierto, setAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const ignoreNextClick = useRef(false);

  // ✅ Detectar si el playground está abierto revisando el DOM
  const [playgroundAbierto, setPlaygroundAbierto] = useState(false);

  useEffect(() => {
    // ✅ Función para detectar si el playground está visible
    const detectarPlayground = () => {
      // Buscar el overlay del playground en el DOM
      const playgroundOverlay = document.querySelector(
        '[style*="rgba(0, 0, 0, 0.5)"][style*="position: fixed"]'
      );
      setPlaygroundAbierto(!!playgroundOverlay);
    };

    // ✅ Observar cambios en el DOM
    const observer = new MutationObserver(detectarPlayground);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    });

    // ✅ Detectar inicial
    detectarPlayground();

    return () => observer.disconnect();
  }, []);

  // ✅ Z-index dinámico basado en si el playground está abierto
  const zIndexMenu = playgroundAbierto ? 10100 : 1200; // Mayor que playground (9999)
  const zIndexOverlay = playgroundAbierto ? 10099 : 1199;

  // Función toggle: abre si está cerrado, cierra si está abierto
  const toggleMenu = () => {

    if (ignoreNextClick.current) {
      ignoreNextClick.current = false;
      return;
    }
    setAbierto((prev) => !prev);
  };

  // Función para cerrar el menú
  const cerrarMenu = useCallback(() => {
    setAbierto(false);
  }, []);

  // Función wrapper que ejecuta la acción original y luego cierra el menú
  const crearManejadorConCierre = (accionOriginal?: () => void) => {
    return () => {
      // Ejecutar la acción original si existe
      if (accionOriginal) {
        accionOriginal();
      }
      // Cerrar el menú después de la acción
      cerrarMenu();
    };
  };

  // Wrappers para las acciones principales
  const handleCambioModo = crearManejadorConCierre(onCambioModo);

  // Función para clonar botones con el manejador de cierre
  const clonarBotonConCierre = (
    boton: React.ReactNode,
    index: number
  ): React.ReactNode => {
    if (React.isValidElement<{ onClick?: () => void }>(boton)) {
      return React.cloneElement(boton, {
        key: index,
        onClick: crearManejadorConCierre(boton.props.onClick),
      });
    }
    return boton;
  };

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    if (!abierto) return;

    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        // Marcar para ignorar el próximo clic en el botón toggle
        ignoreNextClick.current = true;
        cerrarMenu();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [abierto, cerrarMenu]);

  // Portal para menú lateral
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  useEffect(() => {
    let node = document.getElementById("menu-acciones-movil-portal");
    if (!node) {
      node = document.createElement("div");
      node.id = "menu-acciones-movil-portal";
      document.body.appendChild(node);
    }
    setPortalNode(node);
    return () => {
      if (node && node.parentNode) node.parentNode.removeChild(node);
    };
  }, []);

  // ✅ Solo calcular offset cuando esté en playground
  const calcularTopOffset = React.useCallback(() => {
    if (playgroundAbierto) {
      // Buscar el contenedor del calendario dentro del playground
      const calendarioContainer = document.querySelector(
        ".calendario-container"
      );
      if (calendarioContainer) {
        const rect = calendarioContainer.getBoundingClientRect();
        return rect.top + 154; // top del calendario + offset normal
      }
    }
    return 154; // valor normal
  }, [playgroundAbierto]);

  // ✅ Actualizar solo el top cuando cambie el playground
  useEffect(() => {
    if (playgroundAbierto) {
      const actualizarTop = () => calcularTopOffset();
      actualizarTop();
      // Actualizar si hay scroll en el playground
      const interval = setInterval(actualizarTop, 200);
      return () => clearInterval(interval);
    }
  }, [playgroundAbierto, calcularTopOffset]);

  // ✅ Calcular posición relativa al calendario dentro del ejemplo
  const calcularPosicion = React.useCallback(() => {
    if (playgroundAbierto) {
      // ✅ Buscar el calendario DENTRO del ejemplo activo (no el contenedor general)
      const ejemploContainer = document.querySelector(
        "main .calendario-container"
      );
      // ✅ Alternativa: buscar por el ID específico del calendario si existe
      const calendarioEjemplo =
        ejemploContainer ||
        document.querySelector("#calendario-ejemplo") ||
        document.querySelector('[data-calendario="true"]');

      if (calendarioEjemplo) {
        const rect = calendarioEjemplo.getBoundingClientRect();

        // ✅ Buscar la cabecera del calendario del ejemplo para calcular offset
        const cabeceraCalendario = calendarioEjemplo.querySelector(
          ".calendario-cabecera, header, .cabecera-grid"
        );
        const offsetCabecera = cabeceraCalendario
          ? cabeceraCalendario.getBoundingClientRect().height
          : 60;

        return {
          top: rect.top + offsetCabecera, // Desde el top del calendario del ejemplo + cabecera
          left: rect.left + 16, // Desde el left del calendario del ejemplo + margen
          maxHeight: rect.height - offsetCabecera - 20, // Altura disponible dentro del calendario del ejemplo
          // ✅ Información de debug
          debug: {
            calendarioRect: rect,
            offsetCabecera,
            elemento: calendarioEjemplo.className || calendarioEjemplo.tagName,
          },
        };
      } else {
        // ✅ Fallback: si no encuentra el calendario del ejemplo, usar el contenedor general
        console.warn(
          "No se encontró calendario dentro del ejemplo, usando fallback"
        );
        const playgroundMain = document.querySelector("main");
        if (playgroundMain) {
          const rect = playgroundMain.getBoundingClientRect();
          return {
            top: rect.top + 100,
            left: rect.left + 16,
            maxHeight: rect.height - 120,
          };
        }
      }
    }

    // ✅ Posición normal cuando no está en playground
    return {
      top: 154,
      left: abierto ? 16 : -320,
      maxHeight: "79vh",
    };
  }, [playgroundAbierto, abierto]);

  const [posicion, setPosicion] = useState(calcularPosicion());

  // ✅ Actualizar posición cuando cambie el playground, ejemplo activo o se abra/cierre
  useEffect(() => {
    if (playgroundAbierto) {
      const actualizarPosicion = () => {
        const nuevaPosicion = calcularPosicion();
        setPosicion(nuevaPosicion);
      };

      // ✅ Actualizar inmediatamente
      actualizarPosicion();

      // ✅ Observar cambios en el DOM del ejemplo (cuando cambia de ejemplo)
      const observer = new MutationObserver(actualizarPosicion);
      const mainElement = document.querySelector("main");

      if (mainElement) {
        observer.observe(mainElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["class", "style"],
        });
      }

      // ✅ También actualizar con interval como backup
      const interval = setInterval(actualizarPosicion, 300);

      return () => {
        observer.disconnect();
        clearInterval(interval);
      };
    } else {
      setPosicion(calcularPosicion()); // resetear al valor normal
    }
  }, [playgroundAbierto, abierto, calcularPosicion]);

  const menuLateral = (
    <>
      {/* ✅ Overlay igual */}
      <div
        className={`menu-overlay ${abierto ? "visible" : ""}`}
        onClick={cerrarMenu}
        style={{
          zIndex: zIndexOverlay,
        }}
      />

      {/* ✅ Menú con posición relativa al calendario del ejemplo */}
      <menu-lateral
        id="menu-acciones-movil"
        className={abierto ? "abierto" : ""}
        style={{
          border: "1px solid #ccc",
          position: "fixed",
          // ✅ Usar posición calculada dinámicamente
          top: posicion.top,
          left: playgroundAbierto ? posicion.left : posicion.left,
          height: playgroundAbierto ? posicion.maxHeight : "79vh",
          zIndex: zIndexMenu,
          width: "320px",
          maxWidth: playgroundAbierto ? "300px" : "100vw",
          overflowY: "auto", // ✅ Cambiar a auto para scroll si es necesario
          marginLeft: playgroundAbierto ? "0" : "1rem",
          // ✅ Animación condicional
          transform: playgroundAbierto
            ? abierto
              ? "translateX(0)"
              : "translateX(-100%)" // En playground usar transform
            : "none", // Fuera del playground usar left
          visibility: abierto ? "visible" : "hidden",
          transition: playgroundAbierto
            ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s"
            : "left 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s",
        }}
      >
        {/* ✅ Resto exactamente igual */}
        <aside
          ref={menuRef}
          style={{
            height: "100%", // ✅ 100% del contenedor calculado
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            background: "#fff",
            boxShadow: "2px 0 16px rgba(0,0,0,0.12)",
          }}
        >
          <nav>
            <div className="menu-acciones">
              {botonesIzqModo.map((boton, index) => (
                <div className="menu-acciones-fila" key={index}>
                  {clonarBotonConCierre(boton, index)}
                </div>
              ))}

              {mostrarCambioModo && onCambioModoVista && (
                <div className="menu-acciones-fila" key={"selector-modo"}>
                  <SelectorModo
                    onCambioModo={(modo) => {
                      onCambioModoVista(modo);
                      cerrarMenu();
                    }}
                    variante="vertical"
                    mostrarIconos={false}
                    modos={modos}
                  />
                </div>
              )}

              {mostrarCambioModo && !onCambioModoVista && (
                <div className="menu-acciones-fila" key={"modo"}>
                  <QBoton onClick={handleCambioModo} variante={"texto"}>
                    {modoAnio ? t("ui.calendario.modoMes") : t("ui.calendario.modoAno")}
                  </QBoton>
                </div>
              )}

              {playground && (
                <div className="menu-acciones-fila" key={"playground"}>
                  <QBoton onClick={onAbrirPlayground} variante="texto">
                    Playground
                  </QBoton>
                </div>
              )}

              {botonesDerModo.map((boton, index) => (
                <div className="menu-acciones-fila" key={index}>
                  {clonarBotonConCierre(boton, index)}
                </div>
              ))}

              {botonesIzqHoy.map((boton, index) => (
                <div className="menu-acciones-fila" key={index}>
                  {clonarBotonConCierre(boton, index)}
                </div>
              ))}

              {botonesDerHoy.map((boton, index) => (
                <div className="menu-acciones-fila" key={index}>
                  {clonarBotonConCierre(boton, index)}
                </div>
              ))}
            </div>
          </nav>
        </aside>
      </menu-lateral>
    </>
  );

  return (
    <>
      <button
        id="boton-menu-acciones-movil"
        aria-label={abierto ? t("ui.calendario.cerrarMenuAcciones") : t("ui.calendario.abrirMenuAcciones")}
        className="boton-menu-lateral"
        onClick={toggleMenu}
        type="button"
        style={{
          position: "relative",
          zIndex: playgroundAbierto ? 10101 : "auto",
        }}
      >
        <QIcono nombre="menu" tamaño="sm" />
      </button>
      {portalNode && ReactDOM.createPortal(menuLateral, portalNode)}
    </>
  );
}
