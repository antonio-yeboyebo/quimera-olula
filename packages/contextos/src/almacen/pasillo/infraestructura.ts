import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import {
    AccesosPasillo,
    CarasPasillo,
    DeletePasillo,
    GenerarUbicacionesPasillo,
    GetPasillo,
    GetPasillos,
    NuevoPasillo,
    PatchPasillo,
    Pasillo,
    PostPasillo,
    ResultadoGenerarUbicaciones,
} from "./diseño.ts";
import { normalizarAccesos } from "./dominio.ts";
import { tAlmacen } from "../i18n/index.ts";

const baseUrl = `/almacen/pasillo`;

interface PasilloApi {
    id: string;
    zona_id: string;
    zona: string;
    codigo: string;
    orden: number;
    caras: CarasPasillo;
    modulos: number;
    accesos: AccesosPasillo;
}

interface NuevoPasilloApi {
    zona_id: string;
    codigo: string;
    orden: number | null;
    caras: CarasPasillo;
    modulos: number | null;
    accesos: AccesosPasillo;
}

type CambiosPasilloApi = Partial<Omit<NuevoPasilloApi, "zona_id">>;

export const pasilloDesdeApi = (api: PasilloApi): Pasillo => ({
    id: api.id,
    zonaId: api.zona_id,
    zona: api.zona,
    codigo: api.codigo,
    orden: api.orden,
    caras: api.caras,
    modulos: api.modulos,
    accesos: normalizarAccesos(api.accesos),
});

const cambiosPasilloAApi = (p: Partial<NuevoPasillo>): CambiosPasilloApi => {
    const c: CambiosPasilloApi = {};
    if (p.codigo !== undefined) c.codigo = p.codigo;
    if (p.orden !== undefined) c.orden = p.orden;
    if (p.caras !== undefined) c.caras = p.caras;
    if (p.modulos !== undefined) c.modulos = p.modulos;
    if (p.accesos !== undefined) c.accesos = p.accesos;
    return c;
};

export const getPasillo: GetPasillo = async (id) => {
    const respuesta = await RestAPI.get<{ datos: PasilloApi }>(`${baseUrl}/${id}`);
    return pasilloDesdeApi(respuesta.datos);
};

export const getPasillos: GetPasillos = async (filtro, orden, paginacion) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: PasilloApi[]; total: number }>(baseUrl + q);
    return { datos: respuesta.datos.map(pasilloDesdeApi), total: respuesta.total };
};

/** Pasillos de una zona ordenados por `orden` (orden de recorrido). */
export const getPasillosZona = async (zonaId: string): Promise<Pasillo[]> => {
    const resultado = await getPasillos([["zona_id", "==", zonaId]], ["orden", "ASC"]);
    return resultado.datos;
};

export const postPasillo: PostPasillo = async (zonaId, nuevo) => {
    const payload: NuevoPasilloApi = { zona_id: zonaId, ...cambiosPasilloAApi(nuevo) } as NuevoPasilloApi;
    const respuesta = await RestAPI.post<NuevoPasilloApi>(baseUrl, payload, tAlmacen("pasillo.errorAlCrearPasillo"));
    return respuesta.id;
};

export const patchPasillo: PatchPasillo = async (id, cambios) => {
    await RestAPI.patch<CambiosPasilloApi>(
        `${baseUrl}/${id}`,
        cambiosPasilloAApi(cambios),
        tAlmacen("pasillo.errorAlGuardarPasillo")
    );
};

export const deletePasillo: DeletePasillo = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tAlmacen("pasillo.errorAlBorrarPasillo"));
};

export const generarUbicacionesPasillo: GenerarUbicacionesPasillo = async (id, p) => {
    const payload = {
        nivel_desde: p.nivelDesde,
        nivel_hasta: p.nivelHasta,
        huecos_por_nivel: p.huecosPorNivel,
        tipo_ubicacion_id: p.tipoUbicacionId || null,
        modulo_desde: p.moduloDesde,
        modulo_hasta: p.moduloHasta,
    };
    const respuesta = await RestAPI.post<typeof payload>(
        `${baseUrl}/${id}/generar_ubicaciones`,
        payload,
        tAlmacen("pasillo.errorAlGenerarUbicaciones")
    );
    return respuesta as unknown as ResultadoGenerarUbicaciones;
};
