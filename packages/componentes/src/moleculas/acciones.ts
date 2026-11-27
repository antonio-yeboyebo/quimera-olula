import { iconoAccionBoton } from "../atomos/icono_accion.ts";

export type Accion =
  | {
      /** Id estable: solo las acciones con id se pueden destacar al personalizar. */
      id?: string;
      icono?: string;
      texto?: string;
      onClick: () => void;
      deshabilitado?: boolean;
      variante?: "solido" | "borde" | "texto";
      advertencia?: boolean;
      /** Acción principal del detalle: se muestra como botón fuera del menú. */
      principal?: boolean;
    }
  | false;

export type AccionDefinida = Exclude<Accion, false>;

/** La marcada como principal o, si no hay (o está deshabilitada), la primera
 *  con texto que esté habilitada y no sea de advertencia. Así cambia sola
 *  según el estado del documento. */
export const accionPrincipal = (
  acciones: AccionDefinida[]
): AccionDefinida | undefined =>
  acciones.find((accion) => accion.principal && !accion.deshabilitado) ??
  acciones.find(
    (accion) => accion.texto && !accion.deshabilitado && !accion.advertencia
  );

/** Borrar/Eliminar: se pinta como acción destructiva (texto rojo). */
export const esDestructiva = (accion: AccionDefinida): boolean =>
  !!accion.advertencia &&
  !!accion.texto &&
  iconoAccionBoton(accion.texto) === "eliminar";

/** Icono de la acción: el suyo o el que se deduce de su texto. */
export const iconoAccion = (accion: AccionDefinida): string | undefined =>
  accion.icono ?? (accion.texto ? iconoAccionBoton(accion.texto) : undefined);
