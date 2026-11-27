import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { DefinicionWidget, OrigenWidgets, RecursoAgregable } from "./diseño.ts";
import { tComponentes } from "../../i18n/textos.ts";

type WidgetsUsuarioApi = {
  pantalla: string;
  widgets: DefinicionWidget[] | null;
  origen: OrigenWidgets;
};

const url = (pantalla: string) =>
  `/comun/widgets_usuario/${encodeURIComponent(pantalla)}`;

export const getWidgetsUsuario = (pantalla: string) =>
  RestAPI.get<WidgetsUsuarioApi>(url(pantalla));

export const guardarWidgetsUsuario = (
  pantalla: string,
  widgets: DefinicionWidget[]
) =>
  RestAPI.patch<{ widgets: DefinicionWidget[] }>(
    url(pantalla),
    { widgets },
    tComponentes("ui.maestro.errorAlGuardarLosWidgets")
  );

export const restaurarWidgetsUsuario = (pantalla: string) =>
  RestAPI.delete(url(pantalla), tComponentes("ui.maestro.errorAlRestaurarLosWidgets"));

// El registro de recursos no cambia mientras la app está abierta: una sola
// petición por sesión, compartida por todos los maestros.
let recursosAgregables: Promise<RecursoAgregable[]> | null = null;

export const getRecursosAgregables = (): Promise<RecursoAgregable[]> => {
  recursosAgregables ??= RestAPI.get<RecursoAgregable[]>(
    "/comun/agregado"
  ).catch(() => {
    recursosAgregables = null;
    return [];
  });
  return recursosAgregables;
};

/** Cuántas filas da un filtro, sin pedir la lista (botón «Ver N» de los filtros). */
export const getConteo = async (
  recurso: string,
  filtro: Filtro
): Promise<number | null> => {
  const query = criteriaQuery(filtro) || "?";
  const separador = query === "?" ? "" : "&";
  const respuesta = await RestAPI.get<{ totales: Record<string, number | null> }>(
    `/comun/agregado/${recurso}${query}${separador}metricas=conteo`
  );
  return respuesta.totales.conteo ?? null;
};
