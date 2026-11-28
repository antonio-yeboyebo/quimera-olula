import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    ArticuloAbc, ClaseAbc, GetAbc, GetPropuestaPicking, PropuestaPickingFijo, GetPropuesta, GetRecolocacion, PropuestaUbicacion, Recolocacion, UbicacionPropuesta, ResultadoMigracion, UbicarSinUbicar,
} from "./diseño.ts";
import { construirQuery } from "./dominio.ts";
import { tAlmacen } from "../i18n/index.ts";

const baseUrl = `/almacen/slotting`;

interface ArticuloAbcApi {
    articulo_id: string;
    descripcion: string;
    lineas: number;
    unidades: number;
    porcentaje_acumulado: number;
    clase: ClaseAbc;
}

interface UbicacionPropuestaApi {
    ubicacion_id: string;
    ubicacion: string;
    zona: string;
    accesibilidad: number;
    clase_ubicacion: ClaseAbc;
}

interface PropuestaUbicacionApi {
    articulo_id: string;
    clase: ClaseAbc;
    ubicaciones: UbicacionPropuestaApi[];
}

interface RecolocacionApi {
    articulo_id: string;
    clase: ClaseAbc;
    ubicacion: string;
    clase_ubicacion: ClaseAbc;
    accion: "INTERCAMBIAR" | "MOVER";
    con_articulo_id?: string | null;
    con_ubicacion?: string | null;
    beneficio: number;
}

export const articuloAbcDesdeApi = (a: ArticuloAbcApi): ArticuloAbc => ({
    articuloId: a.articulo_id,
    descripcion: a.descripcion,
    lineas: a.lineas,
    unidades: a.unidades,
    porcentajeAcumulado: a.porcentaje_acumulado,
    clase: a.clase,
});

const ubicacionPropuestaDesdeApi = (u: UbicacionPropuestaApi): UbicacionPropuesta => ({
    ubicacionId: u.ubicacion_id,
    ubicacion: u.ubicacion,
    zona: u.zona,
    accesibilidad: u.accesibilidad,
    claseUbicacion: u.clase_ubicacion,
});

export const propuestaDesdeApi = (p: PropuestaUbicacionApi): PropuestaUbicacion => ({
    articuloId: p.articulo_id,
    clase: p.clase,
    ubicaciones: (p.ubicaciones ?? []).map(ubicacionPropuestaDesdeApi),
});

export const recolocacionDesdeApi = (r: RecolocacionApi): Recolocacion => ({
    articuloId: r.articulo_id,
    clase: r.clase,
    ubicacion: r.ubicacion,
    claseUbicacion: r.clase_ubicacion,
    accion: r.accion,
    conArticuloId: r.con_articulo_id ?? null,
    conUbicacion: r.con_ubicacion ?? null,
    beneficio: r.beneficio,
});

interface PropuestaPickingFijoApi {
    articulo_id: string;
    descripcion: string;
    clase: ClaseAbc;
    lineas: number;
    unidades: number;
    ubicacion_id?: string | null;
    ubicacion?: string | null;
    zona?: string | null;
    accesibilidad?: number | null;
    minimo: number;
    maximo: number;
    unidad_reposicion: number;
}

export const propuestaPickingDesdeApi = (p: PropuestaPickingFijoApi): PropuestaPickingFijo => ({
    articuloId: p.articulo_id,
    descripcion: p.descripcion,
    clase: p.clase,
    lineas: p.lineas,
    unidades: p.unidades,
    ubicacionId: p.ubicacion_id ?? null,
    ubicacion: p.ubicacion ?? null,
    zona: p.zona ?? null,
    accesibilidad: p.accesibilidad ?? null,
    minimo: p.minimo,
    maximo: p.maximo,
    unidadReposicion: p.unidad_reposicion,
});

export const getAbc: GetAbc = async (almacenId, dias, origen) => {
    const q = construirQuery({ almacen_id: almacenId, dias, origen });
    const r = await RestAPI.get<{ datos: ArticuloAbcApi[] }>(`${baseUrl}/abc${q}`, tAlmacen("slotting.errorAlCalcularElAbc"));
    return r.datos.map(articuloAbcDesdeApi);
};

export const getPropuesta: GetPropuesta = async (almacenId, articuloId, limite, origen) => {
    const q = construirQuery({ almacen_id: almacenId, articulo_id: articuloId, limite, origen });
    const r = await RestAPI.get<{ datos: PropuestaUbicacionApi }>(
        `${baseUrl}/propuesta${q}`, tAlmacen("slotting.errorAlProponerUbicacion")
    );
    return propuestaDesdeApi(r.datos);
};

export const getRecolocacion: GetRecolocacion = async (almacenId, dias, limite, origen) => {
    const q = construirQuery({ almacen_id: almacenId, dias, limite, origen });
    const r = await RestAPI.get<{ datos: RecolocacionApi[] }>(
        `${baseUrl}/recolocacion${q}`, tAlmacen("slotting.errorAlCalcularLaRecolocacion")
    );
    return r.datos.map(recolocacionDesdeApi);
};

export const getPropuestaPicking: GetPropuestaPicking = async (
    almacenId, dias, origen, clases, cobertura, reposicion
) => {
    const q = construirQuery({ almacen_id: almacenId, dias, origen, clases, cobertura, reposicion });
    const r = await RestAPI.get<{ datos: PropuestaPickingFijoApi[] }>(
        `${baseUrl}/propuesta_picking${q}`, tAlmacen("slotting.errorAlProponerPickingFijo")
    );
    return r.datos.map(propuestaPickingDesdeApi);
};

type ResultadoMigracionApi = {
    simulado: boolean;
    lineas_ubicadas: number;
    unidades_ubicadas: number;
    lineas_retiradas: number;
    unidades_retiradas: number;
    ajustes: { stock_id: string; articulo_id: string; lote_id: string | null; cantidad: number }[];
};

export const resultadoMigracionDesdeApi = (r: ResultadoMigracionApi): ResultadoMigracion => ({
    simulado: r.simulado,
    lineasUbicadas: r.lineas_ubicadas,
    unidadesUbicadas: r.unidades_ubicadas,
    lineasRetiradas: r.lineas_retiradas,
    unidadesRetiradas: r.unidades_retiradas,
    ajustes: r.ajustes.map((a) => ({
        stockId: a.stock_id, articuloId: a.articulo_id, loteId: a.lote_id ?? null, cantidad: a.cantidad,
    })),
});

export const ubicarSinUbicar: UbicarSinUbicar = async (almacenId, ubicacionId, simular) => {
    const r = await RestAPI.query<
        { almacen_id: string; ubicacion_id: string; simular: boolean }, ResultadoMigracionApi
    >(
        "/almacen/stock_ubicacion/ubicar_sin_ubicar",
        { almacen_id: almacenId, ubicacion_id: ubicacionId, simular },
        simular ? tAlmacen("slotting.errorAlSimularLaMigracion") : tAlmacen("slotting.errorAlUbicarElStockSin")
    );
    return resultadoMigracionDesdeApi(r);
};
