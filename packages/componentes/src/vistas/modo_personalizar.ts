import { RefObject, useCallback, useEffect, useState, useSyncExternalStore } from "react";

/**
 * Modo «Personalizar pantalla»: los componentes personalizables de la pantalla
 * (con `pantalla`) se registran como secciones mientras están montados; el
 * botón de la cabecera solo aparece si hay alguna y abre un panel lateral con un
 * hueco por sección. Cada componente pinta su sección en ese hueco con un
 * portal, así usa su propio estado sin copiarlo aquí.
 *
 * Almacén de módulo (no contexto): no exige un proveedor en la plantilla, que
 * no todas las apps usan.
 */

export type SeccionPersonalizable = {
  id: string;
  titulo: string;
};

type Estado = {
  activo: boolean;
  secciones: SeccionPersonalizable[];
  /** Hueco del panel donde pinta cada sección (cuando el panel está abierto). */
  destinos: ReadonlyMap<string, HTMLElement>;
  /** Sección sobre la que está el usuario en el panel: se resalta en pantalla. */
  resaltada: string | null;
};

let estado: Estado = { activo: false, secciones: [], destinos: new Map(), resaltada: null };
const oyentes = new Set<() => void>();

const fijar = (cambios: Partial<Estado>) => {
  estado = { ...estado, ...cambios };
  oyentes.forEach((avisar) => avisar());
};

const suscribir = (avisar: () => void) => {
  oyentes.add(avisar);
  return () => oyentes.delete(avisar);
};

const useEstado = () => useSyncExternalStore(suscribir, () => estado);

export const activarPersonalizar = (activo: boolean) =>
  fijar({ activo, ...(activo ? {} : { resaltada: null }) });

export const resaltarSeccion = (id: string | null) => {
  if (estado.resaltada !== id) fijar({ resaltada: id });
};

/** El panel informa del hueco de cada sección (o null al desmontarse). */
export const fijarDestino = (id: string, elemento: HTMLElement | null) => {
  const actual = estado.destinos.get(id);
  if (actual === (elemento ?? undefined)) return;
  const destinos = new Map(estado.destinos);
  if (elemento) destinos.set(id, elemento);
  else destinos.delete(id);
  fijar({ destinos });
};

/** Para tests. */
export const reiniciarModoPersonalizar = () =>
  fijar({ activo: false, secciones: [], destinos: new Map(), resaltada: null });

export const useModoPersonalizar = () => {
  const { activo, secciones } = useEstado();
  return { activo, secciones, activar: activarPersonalizar };
};

export const useResaltada = () => useEstado().resaltada;

/**
 * Registra una sección mientras el componente está montado y devuelve el
 * hueco del panel donde pintarla (null si el panel está cerrado). Mientras el
 * modo está activo, marca `elemento` como personalizable y lo resalta cuando
 * el usuario pasa por su sección.
 */
export const useSeccionPersonalizable = (
  seccion: SeccionPersonalizable | undefined,
  elemento?: RefObject<HTMLElement | null>
): HTMLElement | null => {
  const { activo, destinos, resaltada } = useEstado();
  const id = seccion?.id;
  const titulo = seccion?.titulo;

  useEffect(() => {
    if (!id || !titulo) return;
    fijar({ secciones: [...estado.secciones.filter((s) => s.id !== id), { id, titulo }] });
    return () => fijar({ secciones: estado.secciones.filter((s) => s.id !== id) });
  }, [id, titulo]);

  useEffect(() => {
    const nodo = elemento?.current;
    if (!nodo || !id) return;
    if (activo) nodo.setAttribute("data-personalizable", "");
    else nodo.removeAttribute("data-personalizable");
    if (activo && resaltada === id) nodo.setAttribute("data-personalizable-resaltado", "");
    else nodo.removeAttribute("data-personalizable-resaltado");
    return () => {
      nodo.removeAttribute("data-personalizable");
      nodo.removeAttribute("data-personalizable-resaltado");
    };
  }, [activo, resaltada, id, elemento]);

  return activo && id ? (destinos.get(id) ?? null) : null;
};

/** Pequeño ayudante: ref de callback que informa del hueco de una sección. */
export const useRefDestino = (id: string) => {
  const [nodo, setNodo] = useState<HTMLElement | null>(null);
  useEffect(() => {
    fijarDestino(id, nodo);
    return () => fijarDestino(id, null);
  }, [id, nodo]);
  return useCallback((el: HTMLElement | null) => setNodo(el), []);
};
