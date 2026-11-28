import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ContextoMaestroPresupuesto, EstadoMaestroPresupuesto, Presupuesto } from "../diseño.ts";
import { tVentas } from "../../i18n/index.ts";

export type { ContextoMaestroPresupuesto, EstadoMaestroPresupuesto, Presupuesto };

// La columna de estado la añade delante MaestroConDetallePresupuesto.
export const metaTablaPresupuesto = (): MetaTabla<Presupuesto> => [
    {
        id: "codigo",
        estilo: "secundario",
        cabecera: tVentas("documento.maestro.codigo"),
        prioridad: "alta",
    },
    {
        id: "nombre_cliente",
        estilo: "destacado",
        cabecera: tVentas("documento.maestro.cliente"),
        prioridad: "alta",
        render: (p) => p.cliente.nombre_cliente,
    },
    {
        id: "fecha",
        cabecera: tVentas("documento.maestro.fecha"),
        tipo: "fecha",
        prioridad: "alta",
    },
    {
        id: "total",
        estilo: "destacado",
        cabecera: tVentas("documento.maestro.total"),
        tipo: "moneda",
        prioridad: "alta",
        divisa: (presupuesto) => presupuesto.divisa_id,
    },
    {
        id: "nombre_agente",
        cabecera: tVentas("documento.maestro.agente"),
        prioridad: "baja",
    },
    {
        id: "almacen_id",
        cabecera: tVentas("documento.maestro.almacen"),
        prioridad: "baja",
    },
];
