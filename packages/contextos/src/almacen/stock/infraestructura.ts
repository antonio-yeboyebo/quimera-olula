import { baseUrlStockUbicacion, StockUbicacionItemApi } from "#/almacen/ubicacion/infraestructura.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import {
    DeleteRegularizacionStock,
    GetRegularizacionesStock,
    GetStock,
    GetStocks,
    PostRegularizacionStock,
    RegularizacionStock,
    StockAPI,
    StockItem,
    StockUbicacion,
} from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

const baseUrlStock = `/almacen/stock`;
const baseUrlRegularizacion = `/almacen/regularizacion_stock`;

export const stockItemFromApi = (stockApi: StockAPI): StockItem => ({
    id: stockApi.id,
    articulo: stockApi.articulo,
    almacen: stockApi.almacen,
    articuloId: stockApi.articulo_id,
    almacenId: stockApi.almacen_id,
    cantidadFisica: stockApi.cantidad_fisica,
    cantidadDisponible: stockApi.cantidad_disponible,
    cantidadReservada: stockApi.cantidad_reservada,
    cantidadPendiente: stockApi.cantidad_pendiente,
    necesidad: stockApi.necesidad ?? null,
    stockMinimo: stockApi.stock_minimo ?? null,
    stockMaximo: stockApi.stock_maximo ?? null,
    fechaUltimaRegularizacion: stockApi.fecha_ultima_regularizacion ?? null,
    horaUltimaRegularizacion: stockApi.hora_ultima_regularizacion ?? null,
    cantidadUltimaRegularizacion: stockApi.cantidad_ultima_regularizacion ?? null,
});

const stockUbicacionFromApi = (api: StockUbicacionItemApi): StockUbicacion => ({
    id: api.id,
    idUbicacion: api.ubicacion_id,
    ubicacion: api.ubicacion,
    cantidad: api.cantidad_fisica,
});

// Las ubicaciones son del SGA: sin él (BD de Eneboo sin SGA) la petición
// puede fallar, y la ficha de stock debe mostrarse igualmente sin ubicaciones.
const getUbicacionesStock = async (id: string): Promise<StockUbicacion[]> => {
    try {
        const respuesta = await RestAPI.get<{ datos: StockUbicacionItemApi[] }>(
            baseUrlStockUbicacion + criteriaQuery([["stock_id", "==", id]] as Filtro, [])
        );
        return respuesta.datos.map(stockUbicacionFromApi);
    } catch {
        return [];
    }
};

export const getStock: GetStock = async (id) => {
    const [stockApi, ubicaciones] = await Promise.all([
        RestAPI.get<{ datos: StockAPI }>(`${baseUrlStock}/${id}`),
        getUbicacionesStock(id),
    ]);
    return {
        ...stockItemFromApi(stockApi.datos),
        ubicaciones,
    };
};

export const getStocks: GetStocks = async (filtro, orden, paginacion?) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: StockAPI[]; total: number }>(baseUrlStock + q);
    return { datos: respuesta.datos.map(stockItemFromApi), total: respuesta.total };
};

export interface RegularizacionStockApi {
    id: string;
    stock_id: string;
    almacen_id: string;
    articulo_id: string;
    descripcion: string | null;
    fecha: string;
    hora: string;
    cantidad_inicial: number;
    cantidad_final: number;
    motivo: string | null;
    inventario_id: string | null;
    lecturas?: number;
    ubicacion?: string | null;
}

export const regularizacionStockDesdeApi = (api: RegularizacionStockApi): RegularizacionStock => ({
    id: api.id,
    stockId: api.stock_id,
    almacenId: api.almacen_id,
    articuloId: api.articulo_id,
    descripcion: api.descripcion,
    fecha: api.fecha,
    hora: api.hora,
    cantidadInicial: api.cantidad_inicial,
    cantidadFinal: api.cantidad_final,
    motivo: api.motivo,
    inventarioId: api.inventario_id,
    lecturas: api.lecturas ?? 0,
    ubicacion: api.ubicacion ?? null,
});

/** Fecha local (no UTC) en formato ISO "AAAA-MM-DD". */
export const fechaLocalAApi = (fecha: Date): string => {
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${fecha.getFullYear()}-${mes}-${dia}`;
};

export const getRegularizacionesStock: GetRegularizacionesStock = async (stockId) => {
    const respuesta = await RestAPI.getQuery<RegularizacionStock, RegularizacionStockApi>(
        baseUrlRegularizacion,
        {
            filtro: [["stock_id", "==", stockId]],
            orden: [],
            paginacion: { limite: 100, pagina: 1 },
        },
        regularizacionStockDesdeApi,
    );
    return respuesta.datos;
};

export const postRegularizacionStock: PostRegularizacionStock = async (stock, nueva) => {
    const respuesta = await RestAPI.post(
        baseUrlRegularizacion,
        {
            almacen_id: stock.almacenId,
            articulo_id: stock.articuloId,
            cantidad: nueva.cantidad,
            fecha: fechaLocalAApi(nueva.fecha),
            hora: nueva.hora,
            motivo: nueva.motivo || null,
        },
        tAlmacen("stock.errorAlRegularizarElStock")
    );
    return respuesta.id;
};

export const deleteRegularizacionStock: DeleteRegularizacionStock = async (id) => {
    await RestAPI.delete(`${baseUrlRegularizacion}/${id}`, tAlmacen("stock.errorAlBorrarLaRegularizacion"));
};
