import { ClaseAbc } from "#/almacen/slotting/diseño.ts";
import { construirQuery } from "#/almacen/slotting/dominio.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    CarasPasillo, ElementoPlanta, GetMapa, Giro, GuardarPlanta, MapaAlmacen, MedidasPlanta, MedidasPropias,
    GetTrazado, MotivoFormula, PlantaAlmacen, TrazadoRecorrido, UbicacionMapa, ZonaMapa,
} from "./diseño.ts";
import { METROS_NIVEL_POR_DEFECTO } from "./dominio.ts";
import { tAlmacen } from "../i18n/index.ts";

const baseUrl = `/almacen/mapa`;

interface PasilloMapaApi {
    pasillo_id: string;
    pasillo: string;
    orden: number;
    caras: CarasPasillo;
    modulos: number;
    accesos: string;
    niveles: number;
}

interface CalculoZonaApi {
    calculo: "DISTANCIA" | "FORMULA";
    motivo: MotivoFormula | null;
    pasillos_sin_colocar: string[];
}

interface ZonaMapaApi {
    zona_id: string;
    zona: string;
    funcion: string;
    pasillos: PasilloMapaApi[];
    accesibilidad?: CalculoZonaApi;
}

interface UbicacionMapaApi {
    ubicacion_id: string;
    ubicacion: string;
    zona_id: string;
    pasillo_id: string | null;
    modulo: number | null;
    nivel: number | null;
    hueco: number | null;
    formato: string | null;
    bloqueada: boolean;
    cantidad: number;
    articulos: string[];
    clase_articulo: ClaseAbc | null;
    clases_almacenamiento: string[];
    accesibilidad: number | null;
    clase_ubicacion: ClaseAbc | null;
    metros_salida?: number | null;
    metros_entrada?: number | null;
    picking_fijo: { articulo_id: string; minimo: number; maximo: number } | null;
}

interface MedidasApi {
    largo_modulo: number | null;
    fondo: number | null;
    ancho_pasillo: number | null;
}

interface PlantaApi {
    ancho: number;
    largo: number;
    medidas: MedidasApi;
    metros_nivel?: number;
    pasillos: { pasillo_id: string; x: number; y: number; giro: number; medidas: MedidasApi }[];
    elementos: ElementoPlanta[];
}

interface MapaAlmacenApi {
    zonas: ZonaMapaApi[];
    ubicaciones: UbicacionMapaApi[];
    planta?: PlantaApi | null;
}

const propiasDesdeApi = (m: MedidasApi | null | undefined): MedidasPropias => ({
    ...(m?.largo_modulo != null ? { largoModulo: m.largo_modulo } : {}),
    ...(m?.fondo != null ? { fondo: m.fondo } : {}),
    ...(m?.ancho_pasillo != null ? { anchoPasillo: m.ancho_pasillo } : {}),
});

const medidasDesdeApi = (m: MedidasApi): MedidasPlanta => ({
    largoModulo: m.largo_modulo ?? 0,
    fondo: m.fondo ?? 0,
    anchoPasillo: m.ancho_pasillo ?? 0,
});

const giroDesdeApi = (g: number): Giro => ([0, 90, 180, 270].includes(g) ? g : 0) as Giro;

export const plantaDesdeApi = (p: PlantaApi | null | undefined): PlantaAlmacen | null =>
    p
        ? {
            ancho: p.ancho,
            largo: p.largo,
            medidas: medidasDesdeApi(p.medidas),
            metrosNivel: p.metros_nivel ?? METROS_NIVEL_POR_DEFECTO,
            pasillos: p.pasillos.map((c) => ({
                pasilloId: c.pasillo_id, x: c.x, y: c.y, giro: giroDesdeApi(c.giro), medidas: propiasDesdeApi(c.medidas),
            })),
            elementos: p.elementos.map((e) => ({ ...e, ubicaciones: e.ubicaciones ?? [] })),
        }
        : null;

const medidasAApi = (m: MedidasPropias): MedidasApi => ({
    largo_modulo: m.largoModulo ?? null,
    fondo: m.fondo ?? null,
    ancho_pasillo: m.anchoPasillo ?? null,
});

export const plantaAApi = (p: PlantaAlmacen): PlantaApi => ({
    ancho: p.ancho,
    largo: p.largo,
    medidas: medidasAApi(p.medidas),
    metros_nivel: p.metrosNivel,
    pasillos: p.pasillos.map((c) => ({ pasillo_id: c.pasilloId, x: c.x, y: c.y, giro: c.giro, medidas: medidasAApi(c.medidas) })),
    elementos: p.elementos,
});

const zonaDesdeApi = (z: ZonaMapaApi): ZonaMapa => ({
    zonaId: z.zona_id,
    zona: z.zona,
    funcion: z.funcion,
    accesibilidad: z.accesibilidad
        ? {
            calculo: z.accesibilidad.calculo,
            motivo: z.accesibilidad.motivo,
            pasillosSinColocar: z.accesibilidad.pasillos_sin_colocar ?? [],
        }
        : { calculo: "FORMULA", motivo: "SIN_PLANTA", pasillosSinColocar: [] },
    pasillos: z.pasillos.map((p) => ({
        pasilloId: p.pasillo_id,
        pasillo: p.pasillo,
        orden: p.orden,
        caras: p.caras,
        modulos: p.modulos,
        accesos: p.accesos,
        niveles: p.niveles,
    })),
});

const ubicacionDesdeApi = (u: UbicacionMapaApi): UbicacionMapa => ({
    ubicacionId: u.ubicacion_id,
    ubicacion: u.ubicacion,
    zonaId: u.zona_id,
    pasilloId: u.pasillo_id,
    modulo: u.modulo,
    nivel: u.nivel,
    hueco: u.hueco,
    formato: u.formato,
    bloqueada: u.bloqueada,
    cantidad: u.cantidad,
    articulos: u.articulos,
    claseArticulo: u.clase_articulo,
    clasesAlmacenamiento: u.clases_almacenamiento,
    accesibilidad: u.accesibilidad,
    claseUbicacion: u.clase_ubicacion,
    metrosSalida: u.metros_salida ?? null,
    metrosEntrada: u.metros_entrada ?? null,
    pickingFijo: u.picking_fijo
        ? { articuloId: u.picking_fijo.articulo_id, minimo: u.picking_fijo.minimo, maximo: u.picking_fijo.maximo }
        : null,
});

export const mapaDesdeApi = (m: MapaAlmacenApi): MapaAlmacen => ({
    zonas: m.zonas.map(zonaDesdeApi),
    ubicaciones: m.ubicaciones.map(ubicacionDesdeApi),
    planta: plantaDesdeApi(m.planta),
});

export const getMapa: GetMapa = async (almacenId, dias, origen) => {
    const respuesta = await RestAPI.get<{ datos: MapaAlmacenApi }>(
        baseUrl + construirQuery({ almacen_id: almacenId, dias, origen })
    );
    return mapaDesdeApi(respuesta.datos);
};

export const guardarPlanta: GuardarPlanta = async (almacenId, planta) => {
    await RestAPI.put(`/almacen/planta/${encodeURIComponent(almacenId)}`, plantaAApi(planta), tAlmacen("mapa.errorAlGuardarLaPlanta"));
};

interface TrazadoApi {
    metros: number | null;
    tramos: { desde: string; hasta: string; metros: number | null; puntos: [number, number][] }[];
    sin_posicion: string[];
}

export const trazadoDesdeApi = (t: TrazadoApi): TrazadoRecorrido => ({
    metros: t.metros,
    tramos: (t.tramos ?? []).map((tramo) => ({
        desde: tramo.desde,
        hasta: tramo.hasta,
        metros: tramo.metros,
        puntos: (tramo.puntos ?? []).map(([x, y]) => ({ x, y })),
    })),
    sinPosicion: t.sin_posicion ?? [],
});

export const getTrazado: GetTrazado = async (almacenId, ubicaciones) => {
    const respuesta = await RestAPI.get<{ datos: TrazadoApi }>(
        `${baseUrl}/trazado` + construirQuery({ almacen_id: almacenId, ubicaciones: ubicaciones.join(",") })
    );
    return trazadoDesdeApi(respuesta.datos);
};
