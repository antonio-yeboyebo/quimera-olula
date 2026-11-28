import { tCrm } from "../../i18n/index.ts";
export const opcionesFuenteLead = [
    { valor: "Origen", get descripcion() { return tCrm("comun.origen"); } },
    { valor: "Otro", get descripcion() { return tCrm("comun.otro"); } },
];
