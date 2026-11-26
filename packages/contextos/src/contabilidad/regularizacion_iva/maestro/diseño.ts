import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { RegularizacionIva } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

export type EstadoMaestroRegularizacionIva = "INICIAL" | "CREANDO";

export type ContextoMaestroRegularizacionIva = {
    estado: EstadoMaestroRegularizacionIva;
    regularizaciones: ListaActivaEntidades<RegularizacionIva>;
};

export const metaTablaRegularizacionIva: MetaTabla<RegularizacionIva> = [
    { id: "ejercicioId", get cabecera() { return tContabilidad("regularizacion_iva.ejercicio"); } },
    { id: "periodo", get cabecera() { return tContabilidad("regularizacion_iva.periodo"); } },
    { id: "fechaInicio", get cabecera() { return tContabilidad("regularizacion_iva.desde"); }, tipo: "fecha" },
    { id: "fechaFin", get cabecera() { return tContabilidad("regularizacion_iva.hasta"); }, tipo: "fecha" },
    { id: "numeroAsiento", get cabecera() { return tContabilidad("regularizacion_iva.asiento"); } },
    { id: "importe", get cabecera() { return tContabilidad("regularizacion_iva.importe"); }, tipo: "numero" },
];

export const metaFiltroRegularizacionIva: MetaFiltro = {
    ejercicio_id: {
        id: "ejercicio_id",
        campo: "ejercicio_id",
        get label() { return tContabilidad("regularizacion_iva.ejercicio"); },
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["ejercicio_id", "eq", valor as string];
        },
    },
};

export const criteriaRegularizacionesIvaDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["fecha_inicio", "DESC"],
});
