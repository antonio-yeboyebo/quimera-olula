import { puedeAlguna } from "@olula/lib/dominio.ts";
import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { useContext, useMemo } from "react";
import { useLocation } from "react-router";
import { useMenuControl } from "../plantilla/useMenuControl.ts";
import { nombreMenu, useTComponentes } from "../i18n/textos.ts";
import { aplanarMenu, PantallaMenu, traducirPantalla, urlActiva } from "./dominio.ts";

const MAX_RECIENTES = 3;

/**
 * Pantallas del menú visibles para el usuario y sus atajos personales, para el
 * menú lateral y la búsqueda rápida.
 */
export const usePantallasMenu = () => {
  const { menu } = useContext(FactoryCtx);
  const { pathname } = useLocation();
  const { favoritos, recientes } = useMenuControl();

  // Nombres en el idioma activo (se busca por ellos y también por el español).
  const t = useTComponentes();
  const pantallas = useMemo(
    () =>
      aplanarMenu(menu, (regla) => puedeAlguna(regla)).map((p) =>
        traducirPantalla(p, nombreMenu)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `t` cambia con el idioma
    [menu, t]
  );
  const porUrl = useMemo(
    () => new Map(pantallas.map((p) => [p.url, p])),
    [pantallas]
  );
  const urls = useMemo(() => [...porUrl.keys()], [porUrl]);

  const aPantallas = (lista: string[]) =>
    lista
      .map((url) => porUrl.get(url))
      .filter((p): p is PantallaMenu => !!p);

  // Los recientes guardan rutas (también de detalles): se reducen a su pantalla,
  // sin la actual ni Inicio, que ya están a la vista.
  const urlActual = urlActiva(urls, pathname);
  const recientesPantallas = aPantallas(
    [...new Set(recientes.map((ruta) => urlActiva(urls, ruta)))]
      .filter((url): url is string => !!url && url !== "/" && url !== urlActual)
      .slice(0, MAX_RECIENTES)
  );

  return {
    menu,
    pantallas,
    urlActual,
    favoritos: aPantallas(favoritos),
    recientes: recientesPantallas,
  };
};
