import { tCrm } from "../../i18n/index.ts";
export const opcionesEstadoBaseOportunidad = [
    { valor: "Pendiente", get descripcion() { return tCrm("comun.pendiente"); } },
    { valor: "Ganada", get descripcion() { return tCrm("comun.ganada"); } },
    { valor: "Perdida", get descripcion() { return tCrm("comun.perdida"); } },
];
