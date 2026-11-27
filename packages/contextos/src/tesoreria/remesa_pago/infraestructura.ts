import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { fechaDesdeApi } from "../comun/infraestructura.js";
import ApiUrls from "../comun/urls.js";
import {
    DeshacerPagoRemesaPago,
    GetNominasRemesables,
    GetRemesaPago,
    GetRemesasPago,
    NominaDeRemesaPago,
    NominaRemesable,
    PagarRemesaPago,
    PagoRemesaPago,
    PostRemesaPago,
    ReciboDeRemesaPago,
    RemesaPago,
    TipoRemesaPago,
} from "./diseño.js";
import { fechaIso } from "./dominio.js";
import { tTesoreria } from "../i18n/index.ts";

interface PagoRemesaPagoApi {
    id: string;
    fecha: string | null;
}

interface ReciboDeRemesaPagoApi {
    id: string;
    codigo: string;
    fecha_vencimiento: string | null;
    estado: string;
    importe: number;
    proveedor_id: string | null;
    nombre_proveedor: string;
}

interface NominaDeRemesaPagoApi {
    id: string;
    empleado_id: string;
    nombre_empleado: string;
    fecha_nomina: string | null;
    estado: string | null;
    importe: number;
}

interface RemesaPagoApi {
    id: string;
    tipo: TipoRemesaPago;
    fecha: string | null;
    fecha_pago: string | null;
    total: number;
    divisa_id: string;
    cuenta_id: string;
    descripcion_cuenta?: string | null;
    estado: string | null;
    empresa_id: string | null;
    recibos?: ReciboDeRemesaPagoApi[];
    nominas?: NominaDeRemesaPagoApi[];
    pagos?: PagoRemesaPagoApi[];
}

interface NominaRemesableApi {
    id: string;
    descripcion: string;
    empleado_id: string;
    nombre_empleado: string;
    fecha_nomina: string | null;
    importe: number;
}

const baseUrl = new ApiUrls().REMESA_PAGO;
const nominasRemesablesUrl = new ApiUrls().NOMINA_REMESABLE;

const pagoDesdeApi = (api: PagoRemesaPagoApi): PagoRemesaPago => ({
    id: api.id,
    fecha: fechaDesdeApi(api.fecha),
});

const reciboDesdeApi = (api: ReciboDeRemesaPagoApi): ReciboDeRemesaPago => ({
    id: api.id,
    codigo: api.codigo,
    fechaVencimiento: fechaDesdeApi(api.fecha_vencimiento),
    estado: api.estado,
    importe: api.importe,
    proveedorId: api.proveedor_id,
    nombreProveedor: api.nombre_proveedor,
});

const nominaDesdeApi = (api: NominaDeRemesaPagoApi): NominaDeRemesaPago => ({
    id: api.id,
    empleadoId: api.empleado_id,
    nombreEmpleado: api.nombre_empleado,
    fechaNomina: fechaDesdeApi(api.fecha_nomina),
    estado: api.estado ?? "",
    importe: api.importe,
});

export const remesaPagoDesdeApi = (api: RemesaPagoApi): RemesaPago => ({
    id: api.id,
    tipo: api.tipo,
    fecha: fechaDesdeApi(api.fecha),
    fechaPago: fechaDesdeApi(api.fecha_pago),
    total: api.total,
    divisaId: api.divisa_id,
    cuentaId: api.cuenta_id,
    descripcionCuenta: api.descripcion_cuenta ?? "",
    estado: api.estado ?? "",
    empresaId: api.empresa_id ?? "",
    recibos: (api.recibos ?? []).map(reciboDesdeApi),
    nominas: (api.nominas ?? []).map(nominaDesdeApi),
    pagos: (api.pagos ?? []).map(pagoDesdeApi),
});

const nominaRemesableDesdeApi = (api: NominaRemesableApi): NominaRemesable => ({
    id: api.id,
    descripcion: api.descripcion,
    empleadoId: api.empleado_id,
    nombreEmpleado: api.nombre_empleado,
    fechaNomina: fechaDesdeApi(api.fecha_nomina),
    importe: api.importe,
});

export const getRemesaPago: GetRemesaPago = async (id) => {
    return await RestAPI.getItem<RemesaPago, RemesaPagoApi>(
        `${baseUrl}/${id}`,
        remesaPagoDesdeApi,
        tTesoreria("remesa_pago.errorAlObtenerLaRemesaDe")
    );
};

export const getRemesasPago: GetRemesasPago = async (criteria) => {
    return await RestAPI.getQuery<RemesaPago, RemesaPagoApi>(
        baseUrl,
        criteria,
        remesaPagoDesdeApi,
        tTesoreria("remesa_pago.errorAlObtenerLasRemesasDe")
    );
};

export const postRemesaPago: PostRemesaPago = async (nueva) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        {
            cuenta_id: nueva.cuentaId,
            recibo_ids: nueva.reciboIds,
            nomina_ids: nueva.nominaIds,
            fecha_pago: nueva.fechaPago ? fechaIso(nueva.fechaPago) : null,
        },
        tTesoreria("remesa_pago.errorAlCrearLaRemesaDe")
    );

    return String(respuesta.id);
};

export const pagarRemesaPago: PagarRemesaPago = async (id, fecha) => {
    await RestAPI.post(
        `${baseUrl}/${id}/pagar`,
        { fecha },
        tTesoreria("remesa_pago.errorAlPagarLaRemesaDe")
    );
};

export const deshacerPagoRemesaPago: DeshacerPagoRemesaPago = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}/pago`,
        tTesoreria("remesa_pago.errorAlDeshacerElPagoDe")
    );
};

export const getNominasRemesables: GetNominasRemesables = async () => {
    return await RestAPI.getLista<NominaRemesable, NominaRemesableApi>(
        nominasRemesablesUrl,
        nominaRemesableDesdeApi,
        tTesoreria("remesa_pago.errorAlObtenerLasNominasRemesables")
    );
};
