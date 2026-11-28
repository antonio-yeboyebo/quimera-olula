import {
    fechaLocalAApi,
    RegularizacionStockApi,
    regularizacionStockDesdeApi,
} from "#/almacen/stock/infraestructura.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    ArticuloLeido,
    CambiosInventario,
    CambiosLineaInventario,
    DeleteInventario,
    DeleteLineaInventario,
    GetInventario,
    GetInventarios,
    GetLineasInventario,
    Inventario,
    LineaInventario,
    LineaRechazada,
    OpcionesCargaFichero,
    PatchInventario,
    PatchLineaInventario,
    PatchRegularizarRestoInventario,
    PostFicheroInventario,
    PostInventario,
    PostLineaInventario,
    ResultadoCargaFichero,
} from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

const baseUrl = `/almacen/inventario`;

// Las líneas de un inventario se piden de una vez (Eneboo las muestra todas).
const LIMITE_LINEAS = 10000;

interface InventarioApi {
    id: string;
    almacen_id: string;
    almacen: string | null;
    fecha: string;
    hora: string;
    observaciones: string | null;
}

export const inventarioDesdeApi = (api: InventarioApi): Inventario => ({
    id: api.id,
    almacenId: api.almacen_id,
    almacen: api.almacen,
    fecha: api.fecha,
    hora: api.hora,
    observaciones: api.observaciones,
});

const cambiosInventarioAApi = (cambios: CambiosInventario) => {
    const api: { observaciones?: string | null } = {};
    if (cambios.observaciones !== undefined) api.observaciones = cambios.observaciones;
    return api;
};

export const getInventario: GetInventario = async (id) =>
    RestAPI.getItem<Inventario, InventarioApi>(`${baseUrl}/${id}`, inventarioDesdeApi);

export const getInventarios: GetInventarios = async (criteria) =>
    RestAPI.getQuery<Inventario, InventarioApi>(baseUrl, criteria, inventarioDesdeApi);

export const postInventario: PostInventario = async (nuevo) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        {
            almacen_id: nuevo.almacenId,
            fecha: fechaLocalAApi(nuevo.fecha),
            hora: nuevo.hora,
            observaciones: nuevo.observaciones || null,
        },
        tAlmacen("inventario.errorAlCrearElInventario")
    );
    return respuesta.id;
};

export const patchInventario: PatchInventario = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        cambiosInventarioAApi(cambios),
        tAlmacen("inventario.errorAlActualizarElInventario")
    );
};

export const deleteInventario: DeleteInventario = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tAlmacen("inventario.errorAlBorrarElInventario"));
};

export const getLineasInventario: GetLineasInventario = async (id) => {
    const respuesta = await RestAPI.getQuery<LineaInventario, RegularizacionStockApi>(
        `${baseUrl}/${id}/linea`,
        {
            filtro: [],
            orden: ["articulo_id", "ASC"],
            paginacion: { limite: LIMITE_LINEAS, pagina: 1 },
        },
        regularizacionStockDesdeApi,
    );
    return respuesta.datos;
};

export const postLineaInventario: PostLineaInventario = async (id, linea) => {
    const respuesta = await RestAPI.post(
        `${baseUrl}/${id}/linea`,
        {
            articulo_id: linea.articuloId,
            cantidad: linea.cantidad,
            motivo: linea.motivo || null,
        },
        tAlmacen("inventario.errorAlCrearLaLineaDe")
    );
    return respuesta.id;
};

export const deleteLineaInventario: DeleteLineaInventario = async (id, lineaId) => {
    await RestAPI.delete(
        `${baseUrl}/${id}/linea/${lineaId}`,
        tAlmacen("inventario.errorAlBorrarLaLineaDe")
    );
};

/**
 * Cuerpo del `PATCH` de una línea: solo lo que cambia. Motivo y ubicación
 * vacíos se envían como null (se vacían).
 */
export const cambiosLineaAApi = (linea: LineaInventario, cambios: CambiosLineaInventario) => {
    const api: { cantidad?: number; motivo?: string | null; ubicacion?: string | null } = {};
    if (Number(cambios.cantidad) !== linea.cantidadFinal) api.cantidad = Number(cambios.cantidad);
    const motivo = cambios.motivo.trim() || null;
    if (motivo !== (linea.motivo ?? null)) api.motivo = motivo;
    const ubicacion = cambios.ubicacion.trim() || null;
    if (ubicacion !== (linea.ubicacion ?? null)) api.ubicacion = ubicacion;
    return api;
};

/**
 * Cambia la línea en el servidor en una sola operación: conserva sus lecturas
 * de fichero (si la cantidad ya no es su suma, el servidor añade una lectura
 * de ajuste) y recalcula el stock.
 */
export const patchLineaInventario: PatchLineaInventario = async (id, linea, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/linea/${linea.id}`,
        cambiosLineaAApi(linea, cambios),
        tAlmacen("inventario.errorAlCambiarLaLineaDe")
    );
    return linea.id;
};

interface ArticuloLeidoApi {
    articulo_id: string;
    descripcion: string | null;
    lecturas: number;
    cantidad: number;
    cantidad_actual: number;
}

export interface ResultadoCargaFicheroApi {
    cargado: boolean;
    lecturas: number;
    lineas: number;
    articulos: ArticuloLeidoApi[];
    rechazadas: LineaRechazada[];
}

const articuloLeidoDesdeApi = (api: ArticuloLeidoApi): ArticuloLeido => ({
    articuloId: api.articulo_id,
    descripcion: api.descripcion,
    lecturas: api.lecturas,
    cantidad: api.cantidad,
    cantidadActual: api.cantidad_actual,
});

export const resultadoCargaFicheroDesdeApi = (
    api: ResultadoCargaFicheroApi
): ResultadoCargaFichero => ({
    cargado: api.cargado,
    lecturas: api.lecturas,
    lineas: api.lineas,
    articulos: (api.articulos ?? []).map(articuloLeidoDesdeApi),
    rechazadas: (api.rechazadas ?? []).map((r) => ({ ...r, cantidad: String(r.cantidad ?? "") })),
});

/** Formulario multipart de `POST /almacen/inventario/<id>/fichero`. */
export const cargaFicheroAFormData = (fichero: File, opciones: OpcionesCargaFichero): FormData => {
    const formData = new FormData();
    formData.append("fichero", fichero, fichero.name);
    if (opciones.separador) formData.append("separador", opciones.separador);
    formData.append("ignorar_primera_linea", String(opciones.ignorarPrimeraLinea));
    formData.append("simular", String(opciones.simular));
    formData.append("omitir_rechazadas", String(opciones.omitirRechazadas));
    return formData;
};

export const postFicheroInventario: PostFicheroInventario = async (id, fichero, opciones) => {
    const respuesta = await RestAPI.query<FormData, ResultadoCargaFicheroApi>(
        `${baseUrl}/${id}/fichero`,
        cargaFicheroAFormData(fichero, opciones),
        tAlmacen("inventario.errorAlCargarElFicheroDe")
    );
    return resultadoCargaFicheroDesdeApi(respuesta);
};

export const patchRegularizarRestoInventario: PatchRegularizarRestoInventario = async (id) => {
    const respuesta = await RestAPI.patch(
        `${baseUrl}/${id}/regularizar_resto`,
        {},
        tAlmacen("inventario.errorAlRegularizarElRestoDel")
    ) as unknown as { lineas: number };
    return respuesta.lineas;
};
