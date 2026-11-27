import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { ConfigVista, OrigenVista, VistaCompartida, VistaGuardada } from "./diseño.ts";

type VistaUsuarioApi = {
  pantalla: string;
  vista: string;
  config: ConfigVista | null;
  origen: OrigenVista;
  /** La empresa o el grupo del usuario han bloqueado la personalización. */
  bloqueada?: boolean;
};

const url = (pantalla: string, vista: string) =>
  `/comun/vista_usuario/${encodeURIComponent(pantalla)}` +
  (vista ? `?vista=${encodeURIComponent(vista)}` : "");

export const getVistaUsuario = (pantalla: string, vista = "") =>
  RestAPI.get<VistaUsuarioApi>(url(pantalla, vista));

export const guardarVistaUsuario = (
  pantalla: string,
  config: ConfigVista,
  vista = ""
) =>
  RestAPI.patch<{ config: ConfigVista }>(
    url(pantalla, vista),
    { config },
    "Error al guardar la vista"
  );

export const restaurarVistaUsuario = (pantalla: string, vista = "") =>
  RestAPI.delete(url(pantalla, vista), "Error al restaurar la vista");

const pantallaUrl = (base: string, pantalla: string) =>
  `${base}/${encodeURIComponent(pantalla)}`;

/** Vistas con nombre que ve el usuario en la pantalla (suyas, de su grupo, de la empresa). */
export const getVistasGuardadas = (pantalla: string) =>
  RestAPI.get<{ pantalla: string; vistas: VistaGuardada[] }>(
    `${pantallaUrl("/comun/vista_usuario", pantalla)}/vistas`
  ).then((respuesta) => respuesta.vistas);

/** Lo compartido con la empresa y los grupos en la pantalla (regla comun.vista_compartida). */
export const getVistasCompartidas = (pantalla: string) =>
  RestAPI.get<{ pantalla: string; compartidas: VistaCompartida[] }>(
    pantallaUrl("/comun/vista_compartida", pantalla)
  ).then((respuesta) => respuesta.compartidas);

export const guardarVistaCompartida = (
  pantalla: string,
  datos: { vista: string; grupo_id: string | null; config: ConfigVista; bloqueada?: boolean }
) =>
  RestAPI.patch(
    pantallaUrl("/comun/vista_compartida", pantalla),
    datos,
    "Error al compartir la vista"
  );

export const borrarVistaCompartida = (pantalla: string, vista: string, grupoId: string | null) => {
  const parametros = new URLSearchParams({ vista });
  if (grupoId) parametros.set("grupo_id", grupoId);
  return RestAPI.delete(
    `${pantallaUrl("/comun/vista_compartida", pantalla)}?${parametros}`,
    "Error al quitar la vista compartida"
  );
};

/** Grupos de usuarios (para compartir con uno); vacío si no hay permiso para listarlos. */
export const getGrupos = () =>
  RestAPI.get<{ datos: { id: string; nombre: string }[] }>("/auth/grupo").then(
    (respuesta) => respuesta.datos
  );
