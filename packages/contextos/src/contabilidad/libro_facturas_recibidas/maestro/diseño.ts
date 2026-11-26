import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { LibroFacturasRecibidas } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

export type EstadoMaestroLibroFacturasRecibidas = "INICIAL" | "CREANDO";

export type ContextoMaestroLibroFacturasRecibidas = {
    estado: EstadoMaestroLibroFacturasRecibidas;
    informes: ListaActivaEntidades<LibroFacturasRecibidas>;
};

export const metaTablaLibroFacturasRecibidas: MetaTabla<LibroFacturasRecibidas> =
    [
        { id: "descripcion", get cabecera() { return tContabilidad("libro_facturas_recibidas.descripcion"); } },
        { id: "ejercicioId", get cabecera() { return tContabilidad("libro_facturas_recibidas.ejercicio"); } },
        { id: "fechaDesde", get cabecera() { return tContabilidad("libro_facturas_recibidas.desde"); } },
        { id: "fechaHasta", get cabecera() { return tContabilidad("libro_facturas_recibidas.hasta"); } },
    ];

/** Filtro explícito: el metaFiltro por defecto usaría el `id` camelCase de la
 * columna como nombre de campo de API, y la API espera snake_case. */
export const metaFiltroLibroFacturasRecibidas: MetaFiltro = {
    descripcion: {
        id: "descripcion",
        campo: "descripcion",
        get label() { return tContabilidad("libro_facturas_recibidas.descripcion"); },
        filtro: (valor) =>
            !valor || valor === ""
                ? null
                : ["descripcion", "~", valor as string],
    },
    ejercicioId: {
        id: "ejercicioId",
        campo: "ejercicio_id",
        get label() { return tContabilidad("libro_facturas_recibidas.ejercicio"); },
        filtro: (valor) =>
            !valor || valor === ""
                ? null
                : ["ejercicio_id", "eq", valor as string],
    },
};

export const criteriaLibroFacturasRecibidasDefecto = (): Criteria => ({
    ...criteriaDefecto,
    orden: ["id", "DESC"],
});
