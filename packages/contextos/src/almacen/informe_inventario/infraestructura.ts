import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    GetHojaInventario,
    GetReportInventario,
    GetResultadoInventario,
    GrupoInventario,
    ResultadoInventario,
} from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

interface FilaInventarioApi {
    referencia: string;
    descripcion: string | null;
    cantidad: number;
    precio: number | null;
    valor: number | null;
}

interface GrupoInventarioApi {
    almacen_id: string;
    almacen: string | null;
    direccion: string | null;
    poblacion: string | null;
    filas: FilaInventarioApi[];
    total: number | null;
}

export interface ResultadoInventarioApi {
    titulo: string;
    valorado: boolean;
    fecha: string | null;
    tipo_valoracion: string | null;
    por_pvp: number | null;
    grupos: GrupoInventarioApi[];
    total: number | null;
    total_articulos: number;
}

const grupoDesdeApi = (api: GrupoInventarioApi): GrupoInventario => ({
    almacenId: api.almacen_id,
    almacen: api.almacen,
    direccion: api.direccion,
    poblacion: api.poblacion,
    filas: (api.filas ?? []).map((fila) => ({
        referencia: fila.referencia,
        descripcion: fila.descripcion,
        cantidad: fila.cantidad,
        precio: fila.precio ?? null,
        valor: fila.valor ?? null,
    })),
    total: api.total ?? null,
});

export const resultadoInventarioDesdeApi = (api: ResultadoInventarioApi): ResultadoInventario => ({
    titulo: api.titulo,
    valorado: api.valorado,
    fecha: api.fecha ?? null,
    tipoValoracion: api.tipo_valoracion ?? null,
    porPvp: api.por_pvp ?? null,
    grupos: (api.grupos ?? []).map(grupoDesdeApi),
    total: api.total ?? null,
    totalArticulos: api.total_articulos ?? 0,
});

export const getResultadoInventario: GetResultadoInventario = async (url, id) =>
    RestAPI.getItem<ResultadoInventario, ResultadoInventarioApi>(
        `${url}/${id}/resultado`,
        resultadoInventarioDesdeApi,
        tAlmacen("informe_inventario.errorAlCalcularElInformeDe")
    );

export const getReportInventario: GetReportInventario = async (url, id) =>
    RestAPI.blob(`${url}/${id}/report`, tAlmacen("informe_inventario.errorAlDescargarElPdfDel"));

export const getHojaInventario: GetHojaInventario = async (url, id, formato) =>
    RestAPI.blob(`${url}/${id}/hoja?formato=${formato}`, tAlmacen("informe_inventario.errorAlDescargarLaHojaDel"));
