import { ReactNode, useEffect, useRef, useState } from "react";
import { QBoton } from "../atomos/qboton.tsx";
import "./qseccion.css";
import { useTComponentes } from "../i18n/textos.ts";

type QSeccionProps = {
    /** Etiqueta pequeña que aparece sobre la sección (opcional). */
    titulo?: string;
    /**
     * Contenido de solo lectura visible cuando la sección está inactiva.
     * Al pulsar sobre él, la sección se activa.
     */
    resumen: ReactNode;
    /**
     * Campos de edición visibles cuando la sección está activa.
     * Los cambios deben ser controlados por el padre vía callbacks propios
     * del editor (p.ej. onChange); el botón Guardar cierra la sección pero
     * no tiene acceso directo al valor editado.
     */
    editor: ReactNode;
    /**
     * Llamado justo antes de cerrar al pulsar Guardar.
     * Útil para confirmar cambios en el estado del padre.
     * Por defecto: noop.
     */
    onGuardar?: () => void;
    /**
     * Llamado justo antes de cerrar al pulsar Cancelar.
     * Útil para revertir cambios en el estado del padre.
     * Por defecto: noop.
     */
    onCancelar?: () => void;
    /** Deshabilita el botón Guardar cuando el contenido no es válido. */
    guardadoDeshabilitado?: boolean;
    /** Cuando es true, la sección no puede activarse (modo solo lectura). */
    soloLectura?: boolean;
};

/**
 * Contenedor activable para secciones de formulario.
 *
 * Alterna entre dos estados:
 * - **Inactivo**: muestra `resumen` (solo lectura). Un clic o Enter lo activa.
 * - **Activo**: muestra `editor` más botones Guardar / Cancelar.
 *
 * El estado de activación es interno; el padre se comunica solo a través de
 * `onGuardar` y `onCancelar`.
 */
export const QSeccion = ({
    titulo,
    resumen,
    editor,
    onGuardar,
    onCancelar,
    guardadoDeshabilitado = false,
    soloLectura = false,
}: QSeccionProps) => {
    const t = useTComponentes();
    const [activa, setActiva] = useState(false);
    const refContenedor = useRef<HTMLDivElement>(null);

    // Al activarse, desplaza la sección a la vista para evitar que quede oculta
    // bajo el borde inferior de la ventana.
    useEffect(() => {
        if (activa) {
            refContenedor.current?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    }, [activa]);

    const activar = () => {
        if (!soloLectura) setActiva(true);
    };

    const desactivar = () => setActiva(false);

    const handleGuardar = () => {
        onGuardar?.();
        desactivar();
    };

    const handleCancelar = () => {
        onCancelar?.();
        desactivar();
    };

    // Cuando está inactiva, el contenedor actúa como botón para teclado y ratón.
    const propsInteractivos = !activa && !soloLectura
        ? {
              role: "button" as const,
              tabIndex: 0,
              onClick: activar,
              onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      activar();
                  }
              },
          }
        : {};

    const modificador = soloLectura
        ? "qseccion--solo-lectura"
        : activa
          ? "qseccion--activa"
          : "qseccion--inactiva";

    return (
        <div
            ref={refContenedor}
            className={`qseccion ${modificador}`}
            aria-expanded={activa}
            {...propsInteractivos}
        >
            {titulo && <span className="qseccion__titulo">{titulo}</span>}

            {activa ? (
                <>
                    {editor}
                    <div className="qseccion__botones">
                        <QBoton variante="texto" onClick={handleCancelar}>
                            {t("ui.moleculas.cancelar")}
                        </QBoton>
                        <QBoton
                            onClick={handleGuardar}
                            deshabilitado={guardadoDeshabilitado}
                        >
                            {t("ui.moleculas.guardar")}
                        </QBoton>
                    </div>
                </>
            ) : (
                <div className="qseccion__resumen">{resumen}</div>
            )}
        </div>
    );
};
