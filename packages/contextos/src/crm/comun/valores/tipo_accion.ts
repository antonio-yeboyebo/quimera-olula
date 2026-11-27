import { tCrm } from "../../i18n/index.ts";
export const opcionesTipoAccion = [
    { valor: "E-mail", get descripcion() { return tCrm("comun.eMail"); } },
    { valor: "Visita", get descripcion() { return tCrm("comun.visita"); } },
    { valor: "Teléfono", get descripcion() { return tCrm("comun.telefono"); } },
    { valor: "Otro", get descripcion() { return tCrm("comun.otro"); } },
    { valor: "Tarea", get descripcion() { return tCrm("comun.tarea"); } },
];
