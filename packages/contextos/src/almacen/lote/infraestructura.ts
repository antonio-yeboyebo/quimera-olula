import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { GetLote, GetLotes, Lote, OpcionesEtiquetaLote, RevisarLote, RevisarLotes } from "./diseño.ts";
import { queryEtiquetaLote } from "./dominio.ts";
import { tAlmacen } from "../i18n/index.ts";

const baseUrl = `/almacen/lote`;

/** Lote de la API. Sin el plugin `produccion`, de `estado` en adelante todo es `null`. */
export interface LoteApi {
    id: string;
    sku: string | null;
    articulo?: string | null;
    caducidad: string | null;
    en_almacen?: number | string | null;
    estado?: string | null;
    cantidad_programada?: number | string | null;
    cantidad_lote?: number | string | null;
    cantidad_total?: number | string | null;
    cantidad_usada?: number | string | null;
    cantidad_reservada?: number | string | null;
    cantidad_por_recibir?: number | string | null;
    cantidad_disponible?: number | string | null;
    orden_id?: string | null;
    fecha_fabricacion?: string | null;
    cliente_id?: string | null;
    cliente?: string | null;
}

const numero = (valor: number | string | null | undefined): number => Number(valor ?? 0) || 0;
const texto = (valor: string | number | null | undefined): string =>
    valor === null || valor === undefined ? "" : String(valor);
const fecha = (valor: string | null | undefined): string => texto(valor).slice(0, 10);

export const loteDesdeApi = (api: LoteApi): Lote => ({
    id: api.id,
    sku: texto(api.sku),
    articulo: texto(api.articulo),
    caducidad: fecha(api.caducidad),
    enAlmacen: numero(api.en_almacen),
    // El plugin `produccion` siempre da el estado (la columna es NOT NULL): sin él, no hay ficha.
    produccion: api.estado === null || api.estado === undefined
        ? null
        : {
            estado: api.estado,
            cantidadProgramada: numero(api.cantidad_programada),
            cantidadLote: numero(api.cantidad_lote),
            cantidadTotal: numero(api.cantidad_total),
            cantidadUsada: numero(api.cantidad_usada),
            cantidadReservada: numero(api.cantidad_reservada),
            cantidadPorRecibir: numero(api.cantidad_por_recibir),
            cantidadDisponible: numero(api.cantidad_disponible),
            ordenId: texto(api.orden_id),
            fechaFabricacion: fecha(api.fecha_fabricacion),
            clienteId: texto(api.cliente_id),
            cliente: texto(api.cliente),
        },
});

const url = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;

export const getLote: GetLote = async (id) => RestAPI.getItem<Lote, LoteApi>(url(id), loteDesdeApi);

export const getLotes: GetLotes = async (criteria: Criteria) =>
    RestAPI.getQuery<Lote, LoteApi>(baseUrl, criteria, loteDesdeApi);

export const revisadosDesdeApi = (respuesta: { revisados?: number | string | null } | null | undefined): number =>
    numero(respuesta?.revisados);

export const revisarLote: RevisarLote = async (id) =>
    revisadosDesdeApi(await RestAPI.query<object, { revisados: number }>(`${url(id)}/revisar`, {}, tAlmacen("lote.errorAlRevisarElLote")));

export const revisarLotes: RevisarLotes = async () =>
    revisadosDesdeApi(await RestAPI.query<object, { revisados: number }>(`${baseUrl}/revisar`, {}, tAlmacen("lote.errorAlRevisarLosLotes")));

/** Etiquetas del lote (PDF, una página por copia; regla `almacen.lote`). */
export const urlEtiquetaLote = (id: string, opciones: OpcionesEtiquetaLote): string =>
    `${url(id)}/etiqueta?${queryEtiquetaLote(opciones)}`;

export const getEtiquetaLote = async (id: string, opciones: OpcionesEtiquetaLote): Promise<Blob> =>
    RestAPI.blob(urlEtiquetaLote(id, opciones), tAlmacen("lote.errorAlImprimirLasEtiquetasDel"));
