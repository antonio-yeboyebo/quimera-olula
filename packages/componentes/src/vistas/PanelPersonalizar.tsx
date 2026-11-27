import {
  PANEL_LATERAL_ABIERTO_EVENT,
  notificarPanelLateralAbierto,
} from "@olula/lib/panel_lateral_events.ts";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { QIcono } from "../atomos/qicono.tsx";
import {
  SeccionPersonalizable,
  activarPersonalizar,
  resaltarSeccion,
  useModoPersonalizar,
  useRefDestino,
} from "./modo_personalizar.ts";
import "./PanelPersonalizar.css";

const Seccion = ({ seccion }: { seccion: SeccionPersonalizable }) => {
  const destino = useRefDestino(seccion.id);
  const conFoco = useRef(false);
  return (
    <section
      className="panel-personalizar-seccion"
      aria-labelledby={`panel-personalizar-${seccion.id}`}
      onMouseEnter={() => resaltarSeccion(seccion.id)}
      onMouseLeave={() => {
        if (!conFoco.current) resaltarSeccion(null);
      }}
      onFocus={() => {
        conFoco.current = true;
        resaltarSeccion(seccion.id);
      }}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        conFoco.current = false;
        resaltarSeccion(null);
      }}
      // El contenido llega por portales desde la pantalla: sus clics no deben
      // subir por el árbol de React hasta el listado o el detalle.
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <h3 id={`panel-personalizar-${seccion.id}`}>{seccion.titulo}</h3>
      <div ref={destino} />
    </section>
  );
};

/** Panel lateral del modo personalizar: una sección por componente de la pantalla. */
const PanelPersonalizar = ({
  secciones,
  onCerrar,
}: {
  secciones: SeccionPersonalizable[];
  onCerrar: () => void;
}) => {
  const panel = useRef<HTMLElement>(null);
  const alCerrar = useRef(onCerrar);
  alCerrar.current = onCerrar;

  // El foco entra al abrir, una sola vez (no en cada cambio de la pantalla).
  useEffect(() => {
    panel.current?.focus();
  }, []);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      // Un menú o un diálogo abiertos se cierran primero.
      if (document.querySelector(".menu-flotante, dialog[open]")) return;
      // Solo desde el panel (o sin foco): Escape en un campo de la pantalla es suyo.
      const foco = document.activeElement;
      if (foco && foco !== document.body && !panel.current?.contains(foco)) return;
      alCerrar.current();
    };
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, []);

  // La pantalla deja sitio al panel en vez de quedar tapada (ver el CSS).
  useEffect(() => {
    document.body.setAttribute("data-modo-personalizar", "");
    return () => document.body.removeAttribute("data-modo-personalizar");
  }, []);

  return createPortal(
    <aside
      ref={panel}
      id="panel-personalizar"
      className="panel-personalizar"
      aria-labelledby="panel-personalizar-titulo"
      tabIndex={-1}
    >
      <header className="panel-personalizar-cabecera">
        <h2 id="panel-personalizar-titulo">Personalizar pantalla</h2>
        <button
          type="button"
          className="panel-personalizar-cerrar"
          aria-label="Cerrar panel de personalización"
          onClick={onCerrar}
        >
          <QIcono nombre="cerrar" tamaño="sm" />
        </button>
      </header>
      <p className="panel-personalizar-ayuda">
        Los cambios se guardan al momento y solo los ves tú.
      </p>
      {secciones.map((seccion) => (
        <Seccion key={seccion.id} seccion={seccion} />
      ))}
    </aside>,
    document.body
  );
};

/**
 * Botón de la cabecera que activa el modo personalizar. Solo aparece si la
 * pantalla tiene algo personalizable.
 */
export const BotonPersonalizar = () => {
  const { activo, secciones } = useModoPersonalizar();
  const boton = useRef<HTMLButtonElement>(null);

  // Al cambiar de pantalla sin secciones, el modo se apaga solo.
  useEffect(() => {
    if (activo && secciones.length === 0) activarPersonalizar(false);
  }, [activo, secciones.length]);

  // Comparte la zona derecha con el menú de usuario y el asistente: al abrirse
  // uno de ellos, el panel se cierra (y avisa al abrirse, para que se cierren).
  useEffect(() => {
    const alAbrirOtro = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== "personalizar") activarPersonalizar(false);
    };
    window.addEventListener(PANEL_LATERAL_ABIERTO_EVENT, alAbrirOtro);
    return () => window.removeEventListener(PANEL_LATERAL_ABIERTO_EVENT, alAbrirOtro);
  }, []);

  const cerrar = useCallback(() => {
    activarPersonalizar(false);
    boton.current?.focus();
  }, []);

  if (secciones.length === 0) return null;

  const abrir = () => {
    activarPersonalizar(true);
    notificarPanelLateralAbierto("personalizar");
  };

  return (
    <>
      <button
        ref={boton}
        type="button"
        id="boton-personalizar"
        className={activo ? "activo" : ""}
        aria-pressed={activo}
        aria-controls={activo ? "panel-personalizar" : undefined}
        aria-label="Personalizar pantalla"
        title="Personalizar esta pantalla"
        onClick={() => (activo ? cerrar() : abrir())}
      >
        <QIcono nombre="ajustes" tamaño="sm" />
      </button>
      {activo && <PanelPersonalizar secciones={secciones} onCerrar={cerrar} />}
    </>
  );
};
