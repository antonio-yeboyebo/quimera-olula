import { empresaActual } from "#/valores/empresaActual.ts";
import { getDireccion, getDirecciones } from "#/ventas/cliente/infraestructura.ts";
import UrlsVentasClass from "#/ventas/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden, RespuestaLista } from "@olula/lib/diseño.ts";
import { criteriaQuery, criteriaQueryUrl } from "@olula/lib/infraestructura.ts";
import { Presupuesto } from "../../ventas/presupuesto/diseño.ts";
import { Accion } from "../accion/diseño.ts";
import { AccionAPI, accionDesdeAPI } from "../accion/infraestructura.ts";
import UrlsCrmClass from "../comun/urls.ts";
import {
    DeleteOportunidadVenta,
    EstadoOportunidad,
    GetOportunidadesVenta,
    GetOportunidadVenta,
    OportunidadVenta,
    PatchOportunidadVenta,
    PostOportunidadVenta,
} from "./diseño.ts";
import { tCrm } from "../i18n/index.ts";

const UrlsCrm = new UrlsCrmClass();
const UrlsVentas = new UrlsVentasClass();

export type OportunidadVentaAPI = OportunidadVenta & {
    fecha_cierre?: string | null;
};

export const oportunidadDesdeAPI = (oportunidadAPI: OportunidadVentaAPI): OportunidadVenta => ({
    ...oportunidadAPI,
    fecha_cierre: oportunidadAPI.fecha_cierre ? new Date(Date.parse(oportunidadAPI.fecha_cierre)) : null,
})

export const getOportunidadVenta: GetOportunidadVenta = async (id) =>
    await RestAPI.get<{ datos: OportunidadVentaAPI }>(`${UrlsCrm.OPORTUNIDAD_VENTA}/${id}`).then((respuesta) => oportunidadDesdeAPI(respuesta.datos));

export const getOportunidadesVenta: GetOportunidadesVenta = async (filtro, orden, paginacion) => {
    const q = criteriaQuery(filtro, orden, paginacion);

    const respuesta = await RestAPI.get<{ datos: OportunidadVentaAPI[]; total: number }>(UrlsCrm.OPORTUNIDAD_VENTA + q);
    return { datos: respuesta.datos.map(oportunidadDesdeAPI), total: respuesta.total };
};

export const postOportunidadVenta: PostOportunidadVenta = async (oportunidad) => {
    const oportunidadAPI = {
        ...oportunidad,
    }
    return await RestAPI.post(UrlsCrm.OPORTUNIDAD_VENTA, oportunidadAPI, tCrm("oportunidadventa.errorAlGuardarOportunidadDeVenta")).then((respuesta) => respuesta.id);
};

export const patchOportunidadVenta: PatchOportunidadVenta = async (id, oportunidad) => {
    const oportunidadAPI = {
        ...oportunidad,
        fecha_cierre: oportunidad.fecha_cierre?.toISOString().slice(0, 10),
    }
    await RestAPI.patch(`${UrlsCrm.OPORTUNIDAD_VENTA}/${id}`, oportunidadAPI, tCrm("oportunidadventa.errorAlGuardarOportunidadDeVenta"));
};

export const deleteOportunidadVenta: DeleteOportunidadVenta = async (id) =>
    await RestAPI.delete(`${UrlsCrm.OPORTUNIDAD_VENTA}/${id}`, tCrm("oportunidadventa.errorAlBorrarOportunidadDeVenta"));

export const getEstadosOportunidadVenta = async (filtro: Filtro, orden: Orden): Promise<EstadoOportunidad[]> => {
    const q = criteriaQuery(filtro, orden);
    return RestAPI.get<{ datos: EstadoOportunidad[] }>(UrlsCrm.ESTADO_OPORTUNIDAD + q).then((respuesta) => respuesta.datos);
}

export const getAccionesOportunidad = async (oportunidadId: string): RespuestaLista<Accion> => {
    const filtro = ['oportunidad_id', oportunidadId] as unknown as Filtro;
    const orden = [] as Orden;

    const q = criteriaQueryUrl(filtro, orden);
    return RestAPI
        .get<{ datos: AccionAPI[], total: number }>(UrlsCrm.ACCION + q)
        .then((respuesta) => ({
            ...respuesta,
            datos: respuesta.datos.map(accionDesdeAPI),
        }));
};

export const getPresupuestosOportunidad = async (oportunidadId: string): RespuestaLista<Presupuesto> => {
    const filtro = ['oportunidad_id', oportunidadId] as unknown as Filtro;
    const orden = [] as Orden;

    const q = criteriaQueryUrl(filtro, orden);
    return RestAPI.get<{ datos: Presupuesto[], total: number }>(UrlsVentas.PRESUPUESTO + q).then((respuesta) => respuesta);
};

export const crearPresupuestoOportunidad = async (oportunidadId: string, cliente_id: string): Promise<string> => {
    if (!cliente_id) {
        throw new Error(tCrm("oportunidadventa.noSePuedeCrearPresupuestoSin"));
    }

    const direcciones = await getDirecciones(cliente_id);
    const direccionFacturacion = direcciones.find((direccion) => direccion.dir_facturacion) ?? direcciones[0];

    if (!direccionFacturacion) {
        throw new Error(tCrm("oportunidadventa.elClienteNoTieneDireccionesDisponibles"));
    }

    const direccion = await getDireccion(cliente_id, direccionFacturacion.id);

    const nuevoPresupuesto = {
        oportunidad_id: oportunidadId,
        cliente: {
            cliente_id: cliente_id,
            direccion_id: direccion.id,
        },
        empresa_id: empresaActual(),
    };

    return await RestAPI.post(UrlsVentas.PRESUPUESTO, nuevoPresupuesto, tCrm("oportunidadventa.errorAlCrearPresupuesto")).then((respuesta) => respuesta.id);
}