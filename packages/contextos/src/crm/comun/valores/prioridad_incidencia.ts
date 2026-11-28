import { tCrm } from "../../i18n/index.ts";

export const opcionesPrioridadIncidencia = [
  { valor: "alta", get descripcion() { return tCrm("comun.alta"); } },
  { valor: "media", get descripcion() { return tCrm("comun.media"); } },
  { valor: "baja", get descripcion() { return tCrm("comun.baja"); } },
];

export const descripcionPrioridadIncidencia = (prioridad: string): string =>
  opcionesPrioridadIncidencia.find((o) => o.valor === prioridad)?.descripcion ??
  prioridad;
