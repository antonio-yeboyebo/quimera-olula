import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { GenerarReposicion, NecesidadReposicion, OrigenReposicion, Reposicion } from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

const baseUrl = `/almacen/reposicion`;

interface OrigenReposicionApi {
    ubicacion_id: string;
    ubicacion: string;
    cantidad: number;
}

interface NecesidadReposicionApi {
    picking_fijo_id: string;
    articulo_id: string;
    descripcion?: string;
    ubicacion_id: string;
    ubicacion: string;
    minimo: number;
    maximo: number;
    unidad_reposicion: number;
    fisico: number;
    entrante: number;
    saliente: number;
    disponible: number;
    cantidad: number;
    falta: number;
    origenes: OrigenReposicionApi[];
}

interface ReposicionApi {
    orden_id: string | null;
    necesidades: NecesidadReposicionApi[];
}

interface PeticionReposicionApi {
    almacen_id: string;
    simular: boolean;
    picking_fijo_ids?: string[];
}

const origenDesdeApi = (o: OrigenReposicionApi): OrigenReposicion => ({
    ubicacionId: o.ubicacion_id,
    ubicacion: o.ubicacion,
    cantidad: o.cantidad,
});

const necesidadDesdeApi = (n: NecesidadReposicionApi): NecesidadReposicion => ({
    pickingFijoId: n.picking_fijo_id,
    articuloId: n.articulo_id,
    descripcion: n.descripcion ?? "",
    ubicacionId: n.ubicacion_id,
    ubicacion: n.ubicacion,
    minimo: n.minimo,
    maximo: n.maximo,
    unidadReposicion: n.unidad_reposicion,
    fisico: n.fisico,
    entrante: n.entrante,
    saliente: n.saliente,
    disponible: n.disponible,
    cantidad: n.cantidad,
    falta: n.falta,
    origenes: (n.origenes ?? []).map(origenDesdeApi),
});

export const reposicionDesdeApi = (r: ReposicionApi): Reposicion => ({
    ordenId: r.orden_id ?? null,
    necesidades: (r.necesidades ?? []).map(necesidadDesdeApi),
});

export const generarReposicion: GenerarReposicion = async (almacenId, simular, pickingFijoIds) => {
    const respuesta = await RestAPI.query<PeticionReposicionApi, ReposicionApi>(
        baseUrl,
        { almacen_id: almacenId, simular, ...(pickingFijoIds ? { picking_fijo_ids: pickingFijoIds } : {}) },
        simular ? tAlmacen("reposicion.errorAlCalcularLaReposicion") : tAlmacen("reposicion.errorAlGenerarElTraspasoDe")
    );
    return reposicionDesdeApi(respuesta);
};
