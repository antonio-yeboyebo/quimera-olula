import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { transformarCriteria } from "@olula/lib/dominio.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { ActualizarLineaTransferenciaStock, ActualizarTransferenciaStock, CrearLineaTransferenciaStock, CrearTransferenciaStock, EliminarLineaTransferenciaStock, EliminarTransferenciaStock, LineaTransferenciaStock, LineaTransferenciaStock_API, NuevaLineaTransferenciaStock, NuevaLineaTransferenciaStock_API, NuevaTransferenciaStock, NuevaTransferenciaStock_API, ObtenerLineasTransferenciaStock, ObtenerLineaTransferenciaStock, ObtenerTransferenciasStock, ObtenerTransferenciaStock, TransferenciaStock, TransferenciaStock_API } from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

const baseUrlTransferencias = `/almacen/transferencia`;

const camposTransferenciaFromAPI: Record<keyof TransferenciaStock_API, keyof TransferenciaStock> = {
    id: "id",
    almacen_origen_id: "origen",
    almacen_destino_id: "destino",
    fecha: "fecha",
    nombre_almacen_origen: "nombre_origen",
    nombre_almacen_destino: "nombre_destino",
};

const camposTransferenciaToAPI: Record<keyof TransferenciaStock, keyof TransferenciaStock_API> = {
    id: "id",
    origen: "almacen_origen_id",
    destino: "almacen_destino_id",
    fecha: "fecha",
    nombre_origen: "nombre_almacen_origen",
    nombre_destino: "nombre_almacen_destino",
};

export const transferenciaStockFromAPI = (transferenciaAPI: TransferenciaStock_API): TransferenciaStock =>
    Object.fromEntries(
        Object.entries(camposTransferenciaFromAPI).map(
            ([api, cli]) => [cli, transferenciaAPI[api as keyof TransferenciaStock_API]]
        )
    ) as TransferenciaStock;

export const transferenciaStockToAPI = (transferencia: TransferenciaStock): TransferenciaStock_API =>
    Object.fromEntries(
        Object.entries(camposTransferenciaToAPI).map(
            ([cli, api]) => [api, transferencia[cli as keyof TransferenciaStock]]
        )
    ) as TransferenciaStock_API;

export const nuevaTransferenciaStockToAPI = (transferencia: NuevaTransferenciaStock): NuevaTransferenciaStock_API => ({
    almacen_origen_id: transferencia.origen,
    almacen_destino_id: transferencia.destino,
    fecha: transferencia.fecha,
});

export const obtenerTransferenciaStock: ObtenerTransferenciaStock = async (id) =>
    await RestAPI.get<{ datos: TransferenciaStock_API }>(`${baseUrlTransferencias}/${id}`).then((respuesta) =>
        transferenciaStockFromAPI(respuesta.datos)
    );

export const obtenerTransferenciasStock: ObtenerTransferenciasStock = async (
    filtro, orden, paginacion
) => {
    const criteria = transformarCriteria(camposTransferenciaToAPI)({ filtro, orden, paginacion });
    const q = criteriaQuery(criteria.filtro, criteria.orden, criteria.paginacion);
    const respuesta = await RestAPI.get<{ datos: TransferenciaStock_API[]; total: number }>(baseUrlTransferencias + q);

    return { datos: respuesta.datos.map(transferenciaStockFromAPI), total: respuesta.total };
};

export const crearTransferenciaStock: CrearTransferenciaStock = async (transferencia) => {
    return await RestAPI.post(baseUrlTransferencias, nuevaTransferenciaStockToAPI(transferencia), tAlmacen("transferencias.errorAlGuardarLaTransferencia")).then(
        (respuesta) => respuesta.id
    );
};

export const actualizarTransferenciaStock: ActualizarTransferenciaStock = async (id, transferencia) => {
    const transferenciaAPI = transferenciaStockToAPI(transferencia as TransferenciaStock);
    const transferencia_limpia = Object.fromEntries(
        Object.entries(transferenciaAPI).map(([k, v]) => [k, v ?? ""])
    );
    await RestAPI.patch(`${baseUrlTransferencias}/${id}`, transferencia_limpia, tAlmacen("transferencias.errorAlGuardarActualizarLaTransferencia", { id }));
};

export const eliminarTransferenciaStock: EliminarTransferenciaStock = async (id) => {
    await RestAPI.delete(`${baseUrlTransferencias}/${id}`, tAlmacen("transferencias.errorAlBorrarLaTransferenciaId", { id }));
}

// LINEAS

const camposLineaTransferenciaFromAPI: Record<keyof LineaTransferenciaStock_API, keyof LineaTransferenciaStock> = {
    id: "id",
    transferencia_id: "transferencia_id",
    sku: "sku",
    descripcion: "descripcion_producto",
    cantidad: "cantidad",
};

const camposLineaTransferenciaToAPI: Record<keyof LineaTransferenciaStock, keyof LineaTransferenciaStock_API> = {
    id: "id",
    transferencia_id: "transferencia_id",
    sku: "sku",
    descripcion_producto: "descripcion",
    cantidad: "cantidad",
};

export const lineaTransferenciaStockFromAPI = (lineaAPI: LineaTransferenciaStock_API): LineaTransferenciaStock =>
    Object.fromEntries(
        Object.entries(camposLineaTransferenciaFromAPI).map(
            ([api, cli]) => [cli, lineaAPI[api as keyof LineaTransferenciaStock_API]]
        )
    ) as LineaTransferenciaStock;

export const lineaTransferenciaStockToAPI = (linea: LineaTransferenciaStock): LineaTransferenciaStock_API =>
    Object.fromEntries(
        Object.entries(camposLineaTransferenciaToAPI).map(
            ([cli, api]) => [api, linea[cli as keyof LineaTransferenciaStock]]
        )
    ) as LineaTransferenciaStock_API;

export const nuevaLineaTransferenciaStockToAPI = (linea: NuevaLineaTransferenciaStock): NuevaLineaTransferenciaStock_API => ({
    sku: linea.sku,
    cantidad: linea.cantidad,
});

export const obtenerLineaTransferenciaStock: ObtenerLineaTransferenciaStock = async (id, idLinea) =>
    await RestAPI.get<{ datos: LineaTransferenciaStock_API }>(`${baseUrlTransferencias}/${id}/linea/${idLinea}`).then((respuesta) =>
        lineaTransferenciaStockFromAPI(respuesta.datos)
    );

export const obtenerLineasTransferenciaStock: ObtenerLineasTransferenciaStock = async (
    id, filtro, orden, paginacion
) => {
    const criteria = transformarCriteria(camposLineaTransferenciaToAPI)({ filtro, orden, paginacion });
    const q = criteriaQuery(criteria.filtro, criteria.orden, criteria.paginacion);
    const respuesta = await RestAPI.get<{ datos: LineaTransferenciaStock_API[]; total: number }>(`${baseUrlTransferencias}/${id}/linea` + q);

    return { datos: respuesta.datos.map(lineaTransferenciaStockFromAPI), total: respuesta.total };
};

export const crearLineaTransferenciaStock: CrearLineaTransferenciaStock = async (id, linea) => {
    return await RestAPI.post(`${baseUrlTransferencias}/${id}/linea`, nuevaLineaTransferenciaStockToAPI(linea), tAlmacen("transferencias.errorAlGuardarLaLineaDe")).then(
        (respuesta) => respuesta.id
    );
};

export const actualizarLineaTransferenciaStock: ActualizarLineaTransferenciaStock = async (id, idLinea, linea) => {
    const lineaAPI = lineaTransferenciaStockToAPI(linea as LineaTransferenciaStock);
    const linea_limpia = Object.fromEntries(
        Object.entries(lineaAPI).map(([k, v]) => [k, v ?? ""])
    );
    await RestAPI.patch(`${baseUrlTransferencias}/${id}/linea/${idLinea}`, linea_limpia, tAlmacen("transferencias.errorAlGuardarActualizarLaLinea", { id, idLinea }));
};

export const eliminarLineaTransferenciaStock: EliminarLineaTransferenciaStock = async (id, idLinea) => {
    await RestAPI.delete(`${baseUrlTransferencias}/${id}/linea/${idLinea}`, tAlmacen("transferencias.errorAlBorrarLaLineaDe", { id, idLinea }));
};
