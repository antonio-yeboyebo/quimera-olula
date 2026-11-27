import { tCrm } from "../../i18n/index.ts";
export const opcionesEstadoLead = [
    { valor: "Estado", get descripcion() { return tCrm("comun.estado"); } },
    { valor: "Otro", get descripcion() { return tCrm("comun.otro"); } },
];
