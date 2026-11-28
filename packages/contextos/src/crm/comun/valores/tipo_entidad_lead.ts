import { tCrm } from "../../i18n/index.ts";
export const opcionesTipoEntidadLead = [
    { valor: "Cliente", get descripcion() { return tCrm("comun.cliente"); } },
    { valor: "Proveedor", get descripcion() { return tCrm("comun.proveedor"); } },
];
