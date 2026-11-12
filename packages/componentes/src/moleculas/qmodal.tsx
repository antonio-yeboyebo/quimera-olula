import { useControlPantalla } from "@olula/lib/controles_pantalla.ts";
import { PropsWithChildren, useEffect, useId, useRef } from "react";
import { QBoton } from "../atomos/qboton.tsx";
import { QIcono } from "../atomos/qicono.tsx";
import "./qmodal.css";

type QModalProps = {
  nombre: string;
  titulo?: string;
  abierto?: boolean;
  onCerrar?: () => void;
  bloquearCierre?: boolean;
  pantallaCompletaMovil?: boolean;
  /** Ocupa toda la ventana también en escritorio (p. ej. vistas a dos columnas). */
  pantallaCompleta?: boolean;
  anchoEstable?: boolean;
  mostrarCabecera?: boolean;
  mostrarBotonCerrar?: boolean;
};

export const QModal = ({
  nombre,
  titulo,
  abierto = false,
  onCerrar = () => {},
  bloquearCierre = false,
  pantallaCompletaMovil = true,
  pantallaCompleta = false,
  anchoEstable = false,
  mostrarCabecera = true,
  mostrarBotonCerrar = true,
  children,
}: PropsWithChildren<QModalProps>) => {
  const refModal = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const cerradoPorEstadoRef = useRef(false);
  const attrs: Record<string, string> = { nombre };

  // "Cierra" por voz / desde el asistente (ver controles_pantalla.ts) — igual que la
  // X: nunca si el modal bloquea el cierre.
  useControlPantalla("modal", () => ({
    describir: () => ({ tipo: "modal", id: "", titulo: titulo ?? nombre }),
    ejecutar: (accion) => {
      if (accion !== "cerrar" || bloquearCierre) return { ok: false, mensaje: "Esta ventana no se puede cerrar así." };
      onCerrar();
      return { ok: true, mensaje: "Cerrado." };
    },
  }), abierto);

  if (pantallaCompletaMovil) {
    attrs["data-pantalla-completa-movil"] = "";
  }

  if (pantallaCompleta) {
    attrs["data-pantalla-completa"] = "";
  }

  if (anchoEstable) {
    attrs["data-ancho-estable"] = "";
  }

  if (titulo) {
    attrs["data-con-titulo"] = "";
  }

  useEffect(() => {
    const modal = refModal.current;
    if (!modal) return;

    if (!abierto) {
      cerradoPorEstadoRef.current = true;
      modal.close();
      return;
    }

    cerradoPorEstadoRef.current = false;
    modal.showModal();
  }, [abierto]);

  useEffect(() => {
    const modal = refModal.current;
    if (!modal) return;

    const manejarCancel = (e: Event) => {
      if (!bloquearCierre) return;
      e.preventDefault();
    };

    const manejarClose = () => {
      if (cerradoPorEstadoRef.current) {
        cerradoPorEstadoRef.current = false;
        return;
      }
      onCerrar?.();
    };

    const manejarClick = (e: MouseEvent, modal: HTMLDialogElement) => {
      if (!modal) return;

      if (e.target === modal) {
        if (bloquearCierre) return;
        return modal.close();
      }
    };

    modal.addEventListener("cancel", manejarCancel);
    modal.addEventListener("close", manejarClose);
    const clickHandler = (e: MouseEvent) => manejarClick(e, modal);
    modal.addEventListener("click", clickHandler);

    return () => {
      modal.removeEventListener("cancel", manejarCancel);
      modal.removeEventListener("close", manejarClose);
      modal.removeEventListener("click", clickHandler);
    };
  }, [bloquearCierre, onCerrar]);

  return (
    <quimera-modal {...attrs}>
      <dialog ref={refModal} aria-labelledby={titulo ? titleId : undefined}>
        {mostrarCabecera && (
          <header>
            {titulo && <h2 id={titleId}>{titulo}</h2>}
            {mostrarBotonCerrar && (
              <form method="dialog">
                <QBoton
                  tamaño="mediano"
                  variante="texto"
                  tipo="submit"
                  props={{ "aria-label": "Cerrar modal", title: "Cerrar" }}
                >
                  <QIcono nombre="cerrar" tamaño="sm" />
                </QBoton>
              </form>
            )}
          </header>
        )}
        <main>{children}</main>
      </dialog>
    </quimera-modal>
  );
};
