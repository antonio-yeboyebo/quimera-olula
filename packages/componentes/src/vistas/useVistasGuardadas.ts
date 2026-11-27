import { useCallback, useEffect, useSyncExternalStore } from "react";
import { VistaGuardada } from "./diseño.ts";
import { getVistasGuardadas } from "./infraestructura.ts";

// Una lista por pantalla, compartida por quien la use (como las preferencias).
const listas = new Map<string, VistaGuardada[]>();
const oyentes = new Map<string, Set<() => void>>();
const cargas = new Map<string, Promise<void>>();
const NINGUNA: VistaGuardada[] = [];

const avisar = (pantalla: string) => oyentes.get(pantalla)?.forEach((f) => f());

/** Vuelve a pedir la lista (tras guardar o borrar una vista). */
export const recargarVistasGuardadas = (pantalla: string): Promise<void> => {
  const enCurso = cargas.get(pantalla);
  if (enCurso) return enCurso;
  // Promise.resolve: también un fallo síncrono acaba en el catch.
  const carga = Promise.resolve()
    .then(() => getVistasGuardadas(pantalla))
    .then((vistas) => {
      listas.set(pantalla, Array.isArray(vistas) ? vistas : NINGUNA);
      avisar(pantalla);
    })
    // Sin servidor (o sin el endpoint) no hay vistas con nombre.
    .catch(() => {
      listas.set(pantalla, NINGUNA);
      avisar(pantalla);
    })
    .finally(() => cargas.delete(pantalla));
  cargas.set(pantalla, carga);
  return carga;
};

/** Para tests y al cambiar de usuario. */
export const olvidarVistasGuardadas = () => {
  listas.clear();
  cargas.clear();
};

/** Vistas con nombre que ve el usuario en `pantalla` (vacío sin pantalla). */
export const useVistasGuardadas = (pantalla: string | undefined): VistaGuardada[] => {
  const suscribir = useCallback(
    (avisarme: () => void) => {
      if (!pantalla) return () => undefined;
      const conjunto = oyentes.get(pantalla) ?? new Set();
      conjunto.add(avisarme);
      oyentes.set(pantalla, conjunto);
      return () => conjunto.delete(avisarme);
    },
    [pantalla]
  );
  const vistas = useSyncExternalStore(suscribir, () =>
    pantalla ? (listas.get(pantalla) ?? NINGUNA) : NINGUNA
  );

  useEffect(() => {
    if (pantalla && !listas.has(pantalla)) void recargarVistasGuardadas(pantalla);
  }, [pantalla]);

  return vistas;
};
