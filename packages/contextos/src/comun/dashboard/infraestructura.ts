import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
  ComponenteDashboard,
  ConsultaComponente,
  Dashboard,
  PropuestaComponente,
  PropuestaDashboard,
  RecursoAgregable,
  RespuestaAgregado,
  ResumenDashboard,
} from "./diseño.ts";
import { queryConsulta } from "./dominio.ts";
import { tComun } from "../i18n/index.ts";

const URL = "/comun/dashboard";

// Ids de recurso agregable: `ventas.factura`, `ventas.factura.linea`... El servidor
// solo guarda consultas sobre recursos de su registro; esto evita además que un valor
// raro llegue a formar otra ruta de la API.
const RE_RECURSO = /^[a-z_]+(\.[a-z_]+)*$/;

const urlDashboard = (id: string) => `${URL}/${encodeURIComponent(id)}`;

type ResumenDashboardApi = {
  id: string;
  nombre: string;
  clave: string | null;
  compartido: boolean;
  propietario: string;
  es_propio: boolean;
  actualizado_en: string;
};

type DashboardApi = ResumenDashboardApi & {
  componentes: ComponenteDashboard[];
  componentes_ocultos: number;
};

const resumenDesdeApi = (d: ResumenDashboardApi): ResumenDashboard => ({
  id: d.id,
  nombre: d.nombre,
  clave: d.clave,
  compartido: d.compartido,
  propietario: d.propietario,
  esPropio: d.es_propio,
  actualizadoEn: d.actualizado_en,
});

// Los componentes viajan igual que se guardan: el servidor no los traduce.
export const dashboardDesdeApi = (d: DashboardApi): Dashboard => ({
  ...resumenDesdeApi(d),
  componentes: d.componentes.map((c) => ({ ...c, opciones: c.opciones ?? {} })),
  componentesOcultos: d.componentes_ocultos,
});

export const getDashboards = async (): Promise<ResumenDashboard[]> => {
  const respuesta = await RestAPI.get<{ datos: ResumenDashboardApi[] }>(URL);
  return respuesta.datos.map(resumenDesdeApi);
};

export const getDashboard = async (id: string): Promise<Dashboard> => {
  const respuesta = await RestAPI.get<{ datos: DashboardApi }>(urlDashboard(id));
  return dashboardDesdeApi(respuesta.datos);
};

export type NuevoDashboard = {
  nombre: string;
  clave?: string | null;
  compartido?: boolean;
  componentes?: ComponenteDashboard[];
};

export const crearDashboard = async (nuevo: NuevoDashboard): Promise<string> => {
  const { id } = await RestAPI.post(URL, nuevo, tComun("dashboard.errorAlCrearElDashboard"));
  return id;
};

export type CambiosDashboard = Partial<
  Pick<Dashboard, "nombre" | "compartido" | "componentes">
>;

export const cambiarDashboard = (id: string, cambios: CambiosDashboard) =>
  RestAPI.patch(urlDashboard(id), cambios, tComun("dashboard.errorAlGuardarElDashboard"));

export const borrarDashboard = (id: string) =>
  RestAPI.delete(urlDashboard(id), tComun("dashboard.errorAlBorrarElDashboard"));

export const getAgregado = async (
  consulta: ConsultaComponente
): Promise<RespuestaAgregado> => {
  if (!RE_RECURSO.test(consulta.recurso)) {
    throw new Error(tComun("dashboard.recursoNoValidoRecurso", { recurso: consulta.recurso }));
  }
  return RestAPI.get<RespuestaAgregado>(
    `/comun/agregado/${encodeURIComponent(consulta.recurso)}${queryConsulta(consulta)}`
  );
};

// El registro no cambia mientras la app está abierta y ya viene filtrado por los
// permisos del usuario: una petición por sesión.
let recursos: Promise<RecursoAgregable[]> | null = null;

export const getRecursos = (): Promise<RecursoAgregable[]> => {
  recursos ??= RestAPI.get<RecursoAgregable[]>("/comun/agregado").catch(() => {
    recursos = null;
    return [];
  });
  return recursos;
};

/** El motivo que da el servidor cuando no puede proponer (400, texto o JSON de texto). */
const motivoError = (error: unknown): string => {
  const descripcion = (error as { descripcion?: string })?.descripcion;
  if (!descripcion) return tComun("dashboard.noSeHaPodidoPreguntarA");
  try {
    const texto = JSON.parse(descripcion);
    return typeof texto === "string" ? texto : descripcion;
  } catch {
    return descripcion;
  }
};

export const proponerComponente = async (pregunta: string): Promise<PropuestaComponente> => {
  try {
    return (await RestAPI.post(`${URL}/proponer`, { pregunta })) as unknown as PropuestaComponente;
  } catch (error) {
    throw new Error(motivoError(error));
  }
};

export const proponerDashboard = async (peticion: string): Promise<PropuestaDashboard> => {
  try {
    return (await RestAPI.post(`${URL}/proponer-dashboard`, {
      peticion,
    })) as unknown as PropuestaDashboard;
  } catch (error) {
    throw new Error(motivoError(error));
  }
};

// Si hay un modelo de IA activo. Una petición por sesión: si falla, sin IA (y se
// reintenta la próxima vez).
let iaDisponible: Promise<boolean> | null = null;

export const getIaDisponible = (): Promise<boolean> => {
  iaDisponible ??= RestAPI.get<{ disponible: boolean }>("/comun/ia-disponible")
    .then((r) => r.disponible === true)
    .catch(() => {
      iaDisponible = null;
      return false;
    });
  return iaDisponible;
};
