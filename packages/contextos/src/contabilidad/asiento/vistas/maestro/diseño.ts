import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ItemAsiento } from "../../diseño.ts";
import { tContabilidad } from "../../../i18n/index.ts";

// Con el maestro contraído al 30% solo caben las columnas de prioridad alta.
export const metaTablaAsiento: MetaTabla<ItemAsiento> = [
    { id: "numero", get cabecera() { return tContabilidad("asiento.n"); }, prioridad: "alta" },
    { id: "fecha", get cabecera() { return tContabilidad("asiento.fecha"); }, tipo: "fecha", prioridad: "alta" },
    { id: "concepto", get cabecera() { return tContabilidad("asiento.concepto"); }, prioridad: "baja" },
    { id: "importe", get cabecera() { return tContabilidad("asiento.importe"); }, tipo: "moneda", prioridad: "alta" },
    {
        id: "manual",
        get cabecera() { return tContabilidad("asiento.manual"); },
        prioridad: "baja",
        render: (a) => (a.manual ? tContabilidad("asiento.si") : tContabilidad("asiento.no")),
    },
];
