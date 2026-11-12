import { filtroAgente, filtroProvincia } from "#/ventas/comun/filtros.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ComparativaVentas } from "../diseño.ts";

export type EstadoMaestroComparativaVentas = "INICIAL" | "CREANDO";

export type ContextoMaestroComparativaVentas = {
    estado: EstadoMaestroComparativaVentas;
    comparativas: ListaActivaEntidades<ComparativaVentas>;
};

export const metaTablaComparativaVentas: MetaTabla<ComparativaVentas> = [
    { id: "descripcion", cabecera: "Descripción" },
    { id: "fecha_desde", cabecera: "Fecha desde", tipo: "fecha", render: (c) => c.fechaDesde },
    { id: "fecha_hasta", cabecera: "Fecha hasta", tipo: "fecha", render: (c) => c.fechaHasta },
    { id: "nombre_cliente", cabecera: "Cliente", render: (c) => c.nombreCliente },
    { id: "nombre_agente", cabecera: "Agente", render: (c) => c.nombreAgente },
    { id: "busqueda_agente", cabecera: "Selección agente", render: (c) => c.busquedaAgente },
    { id: "nombre_provincia", cabecera: "Provincia", render: (c) => c.nombreProvincia },
];

export const metaFiltroComparativaVentas: MetaFiltro = {
    descripcion: {
        id: "descripcion",
        campo: "descripcion",
        label: "Descripción",
        filtro: (valor) =>
            !valor || valor === "" ? null : ["descripcion", "~", valor as string],
    },
    anioDesde: {
        id: "anioDesde",
        campo: "anio_desde",
        label: "Año desde",
        filtro: (valor) =>
            !valor || valor === "" ? null : ["anio_desde", "eq", valor as string],
    },
    agente_id: filtroAgente,
    provincia_id: filtroProvincia,
};

export const criteriaComparativaVentasDefecto = (): Criteria => ({
    ...criteriaDefecto,
    orden: ["descripcion", "ASC"],
});
