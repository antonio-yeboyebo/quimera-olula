import { formatearFechaString, formatearMoneda } from "@olula/lib/dominio.ts";
import {
  ElementoMenu,
  ElementoMenuHijo,
  ElementoMenuPadre,
  pluginsActivos,
  disponibleEnSaas,
} from "@olula/lib/menu.ts";

/** Pantalla del menú ya aplanada (grupo › pantalla) para buscar y listar. */
export type PantallaMenu = {
  nombre: string;
  grupo: string;
  url: string;
  icono?: string;
  alias: string[];
  descripcion: string;
};

export type PartesTexto = { antes: string; coincide: string; despues: string };

/** Minúsculas y sin acentos: "Almacén" y "almacen" son lo mismo al buscar. */
export const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Trocea el texto para resaltar la coincidencia (la normalización no cambia
 *  la longitud de los caracteres españoles, así que los índices valen). */
export const partesCoincidencia = (
  texto: string,
  busqueda: string
): PartesTexto => {
  const q = normalizar(busqueda.trim());
  const i = q ? normalizar(texto).indexOf(q) : -1;
  if (i < 0) return { antes: texto, coincide: "", despues: "" };
  return {
    antes: texto.slice(0, i),
    coincide: texto.slice(i, i + q.length),
    despues: texto.slice(i + q.length),
  };
};

/** Grupo con pantallas. `crearMenu` deja las entradas sueltas (Inicio) como
 *  grupo con `url` y sin subelementos: esas son enlaces directos. */
export const esPadre = (e: ElementoMenu): e is ElementoMenuPadre =>
  "subelementos" in e && e.subelementos.length > 0;

/** Pantallas visibles para el usuario, en el orden del menú. */
export const aplanarMenu = (
  menu: ElementoMenu[],
  puede: (regla: string | string[]) => boolean
): PantallaMenu[] => {
  const visible = (e: ElementoMenu) =>
    (!e.regla || puede(e.regla)) && pluginsActivos(e) && disponibleEnSaas(e);
  const pantalla = (hijo: ElementoMenuHijo, grupo: string): PantallaMenu => ({
    nombre: hijo.nombre,
    grupo,
    url: hijo.url,
    icono: hijo.icono,
    alias: hijo.alias ?? [],
    descripcion: hijo.descripcionIA ?? "",
  });
  return menu.filter(visible).flatMap((e) =>
    esPadre(e)
      ? e.subelementos
          .filter(visible)
          .map((hijo) => ({ ...pantalla(hijo, e.nombre), icono: e.icono }))
      : "url" in e
        ? [pantalla(e as ElementoMenuHijo, "")]
        : []
  );
};

/** La pantalla del menú que corresponde a la ruta (incluye detalles: /x/123). */
export const urlActiva = (
  urls: string[],
  ruta: string
): string | undefined =>
  urls
    .filter((url) =>
      url === "/" ? ruta === "/" : ruta === url || ruta.startsWith(`${url}/`)
    )
    .sort((a, b) => b.length - a.length)[0];

const ORDEN_AREAS = [
  "Comercial",
  "Operaciones",
  "Finanzas",
  "Organización",
  "Sistema",
];

/** Grupos bajo su área (título visual). Sin área van primero y sin título; las
 *  áreas desconocidas, al final en orden de aparición. */
export const agruparPorArea = <T extends { area?: string }>(
  grupos: T[]
): { area: string; grupos: T[] }[] => {
  const enOrden = [...new Set(grupos.map((g) => g.area ?? ""))];
  const rango = (area: string) => {
    if (area === "") return -1;
    const conocida = ORDEN_AREAS.indexOf(area);
    return conocida >= 0 ? conocida : ORDEN_AREAS.length + enOrden.indexOf(area);
  };
  const areas = [...enOrden].sort((a, b) => rango(a) - rango(b));
  return areas.map((area) => ({
    area,
    grupos: grupos.filter((g) => (g.area ?? "") === area),
  }));
};

/** Relevancia de una pantalla para lo escrito (menor es mejor; null = no sale):
 *  empieza por → inicio de palabra → contiene → grupo → sinónimo → descripción. */
export const puntuarPantalla = (
  pantalla: PantallaMenu,
  busqueda: string
): { puntos: number; alias?: string } | null => {
  const q = normalizar(busqueda.trim());
  if (!q) return { puntos: 0 };
  const nombre = normalizar(pantalla.nombre);
  if (nombre.startsWith(q)) return { puntos: 0 };
  if (nombre.includes(` ${q}`)) return { puntos: 1 };
  if (nombre.includes(q)) return { puntos: 2 };
  if (normalizar(pantalla.grupo).includes(q)) return { puntos: 3 };
  const alias = pantalla.alias.find((a) => normalizar(a).includes(q));
  if (alias) return { puntos: 4, alias };
  if (q.length >= 3 && normalizar(pantalla.descripcion).includes(q))
    return { puntos: 5 };
  return null;
};

export const buscarPantallas = (
  pantallas: PantallaMenu[],
  busqueda: string,
  limite = 12
) =>
  pantallas
    .map((pantalla, orden) => ({
      pantalla,
      orden,
      resultado: puntuarPantalla(pantalla, busqueda),
    }))
    .filter((r) => r.resultado !== null)
    .sort(
      (a, b) => a.resultado!.puntos - b.resultado!.puntos || a.orden - b.orden
    )
    .slice(0, limite)
    .map((r) => ({ ...r.pantalla, aliasCoincide: r.resultado!.alias }));

/** Resultado de la búsqueda de datos (GET /comun/busqueda), agrupado por tipo. */
export type ResultadoBusquedaDatos = {
  id: string | number;
  titulo: string;
  detalle: string;
  fecha: string | null;
  importe: number | null;
};

export type GrupoBusquedaDatos = {
  tipo: string;
  recurso: string;
  ruta: string;
  total: number;
  resultados: ResultadoBusquedaDatos[];
};

/** "Ferretería Ruiz · 22/10/2026 · 1.284,30 €" */
export const detalleResultadoDatos = (r: ResultadoBusquedaDatos) =>
  [
    r.detalle,
    r.fecha ? formatearFechaString(r.fecha) : "",
    r.importe !== null && r.importe !== undefined
      ? formatearMoneda(r.importe, "EUR")
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

/** Añade la url al principio de los recientes (sin repetir, máximo `maximo`). */
export const anotarReciente = (recientes: string[], url: string, maximo = 3) =>
  [url, ...recientes.filter((r) => r !== url)].slice(0, maximo);
