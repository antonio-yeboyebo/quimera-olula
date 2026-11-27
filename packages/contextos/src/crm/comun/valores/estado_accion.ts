import { tCrm } from "../../i18n/index.ts";
export const opcionesEstadoAccion = [
    { valor: "Pendiente", get descripcion() { return tCrm("comun.pendiente"); } },
    { valor: "Hecha", get descripcion() { return tCrm("comun.hecha"); } },
    { valor: "Borrador", get descripcion() { return tCrm("comun.borrador"); } },
];
