import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Amortizacion } from "../diseño.ts";
import { textoEstadoAmortizacion } from "../dominio.ts";
import { tContabilidad } from "../../i18n/index.ts";

export type EstadoMaestroAmortizacion = "INICIAL" | "CREANDO" | "GENERANDO" | "DESHACIENDO";

export type ContextoMaestroAmortizacion = {
    estado: EstadoMaestroAmortizacion;
    amortizaciones: ListaActivaEntidades<Amortizacion>;
};

export const metaTablaAmortizacion: MetaTabla<Amortizacion> = [
    { id: "id", get cabecera() { return tContabilidad("amortizacion.codigo"); } },
    { id: "elemento", get cabecera() { return tContabilidad("amortizacion.elemento"); } },
    { id: "estado", get cabecera() { return tContabilidad("amortizacion.estado"); }, render: (a) => textoEstadoAmortizacion(a.estado) },
    { id: "fecha", get cabecera() { return tContabilidad("amortizacion.adquisicion"); }, tipo: "fecha" },
    { id: "grupoId", get cabecera() { return tContabilidad("amortizacion.grupo"); } },
    { id: "valorAmortizable", get cabecera() { return tContabilidad("amortizacion.vAmortizable"); }, tipo: "moneda" },
    { id: "totalAmortizado", get cabecera() { return tContabilidad("amortizacion.amortizado"); }, tipo: "moneda" },
    { id: "pendiente", get cabecera() { return tContabilidad("amortizacion.pendiente"); }, tipo: "moneda" },
];

const filtroTexto = (campo: string, label: string) => ({
    id: campo,
    campo,
    label,
    filtro: (valor: unknown) => {
        if (!valor || valor === "") return null;
        return [campo, "~", valor as string] as [string, string, string];
    },
});

export const metaFiltroAmortizacion: MetaFiltro = {
    get id() { return filtroTexto("id", tContabilidad("amortizacion.codigo")); },
    get elemento() { return filtroTexto("elemento", tContabilidad("amortizacion.elemento")); },
    get grupo_id() { return filtroTexto("grupo_id", tContabilidad("amortizacion.grupo")); },
    estado: {
        id: "estado",
        campo: "estado",
        get label() { return tContabilidad("amortizacion.estadoEnCursoTerminadaSuspendidaCerrada"); },
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["estado", "=", valor as string];
        },
    },
};

export const criteriaAmortizacionesDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["id", "ASC"],
});
