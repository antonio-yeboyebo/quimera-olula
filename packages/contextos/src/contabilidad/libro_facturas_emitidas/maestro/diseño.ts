import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { LibroFacturasEmitidas } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

export type EstadoMaestroLibroFacturasEmitidas = "INICIAL" | "CREANDO";

export type ContextoMaestroLibroFacturasEmitidas = {
    estado: EstadoMaestroLibroFacturasEmitidas;
    informes: ListaActivaEntidades<LibroFacturasEmitidas>;
};

export const metaTablaLibroFacturasEmitidas: MetaTabla<LibroFacturasEmitidas> =
    [
        { id: "descripcion", get cabecera() { return tContabilidad("libro_facturas_emitidas.descripcion"); } },
        { id: "ejercicioId", get cabecera() { return tContabilidad("libro_facturas_emitidas.ejercicio"); } },
        { id: "fechaDesde", get cabecera() { return tContabilidad("libro_facturas_emitidas.desde"); } },
        { id: "fechaHasta", get cabecera() { return tContabilidad("libro_facturas_emitidas.hasta"); } },
    ];

/** Filtro explícito: el metaFiltro por defecto usaría el `id` camelCase de la
 * columna como nombre de campo de API, y la API espera snake_case. */
export const metaFiltroLibroFacturasEmitidas: MetaFiltro = {
    descripcion: {
        id: "descripcion",
        campo: "descripcion",
        get label() { return tContabilidad("libro_facturas_emitidas.descripcion"); },
        filtro: (valor) =>
            !valor || valor === ""
                ? null
                : ["descripcion", "~", valor as string],
    },
    ejercicioId: {
        id: "ejercicioId",
        campo: "ejercicio_id",
        get label() { return tContabilidad("libro_facturas_emitidas.ejercicio"); },
        filtro: (valor) =>
            !valor || valor === ""
                ? null
                : ["ejercicio_id", "eq", valor as string],
    },
};

export const criteriaLibroFacturasEmitidasDefecto = (): Criteria => ({
    ...criteriaDefecto,
    orden: ["id", "DESC"],
});
