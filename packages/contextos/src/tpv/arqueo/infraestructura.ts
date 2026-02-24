import ApiUrls from "#/tpv/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import { Filtro, Orden, Paginacion } from "@olula/lib/diseño.js";
import { criteriaAQueryString, criteriaQuery } from "@olula/lib/infraestructura.js";
import { agenteActivo, puntoVentaLocal } from "../comun/infraestructura.ts";
import { ArqueoTpv, CabeceraArqueoTpv, DeleteArqueoTpv, GetArqueosTpv, GetArqueoTpv, GetPagosArqueoTpv, MovimientoArqueoTpv, PagoArqueoTpv, PatchArqueo, PatchBorrarMovimiento, PatchCerrarArqueo, PatchCrearMovimiento, PatchReabrirArqueo, PatchRecuentoArqueo, PostArqueoTpv } from "./diseño.ts";

interface CabeceraArqueoTpvApi {
    id: string;
    fechahora_apertura: string;
    agente_apertura_id: string;
    fechahora_cierre: string | null;
    agente_cierre_id: string | null;
    abierto: boolean;
    pagos_efectivo: number;
    pagos_tarjeta: number;
    pagos_vale: number;
    recuento_efectivo: number;
    recuento_tarjeta: number;
    recuento_vales: number;
    recuento_caja: Record<string, number>;
    movimiento_cierre: number;
    efectivo_inicial: number
}
interface MovimientoArqueoTpvApi {
    id: string;
    importe: number;
    fecha: string;
    agente_id: string;
    agente: string;
}

interface ArqueoTpvApi extends CabeceraArqueoTpvApi {
    movimientos: MovimientoArqueoTpvApi[]
}

const baseUrl = new ApiUrls().ARQUEO;

export const cabeceraArqueoDesdeApi = (a: CabeceraArqueoTpvApi): CabeceraArqueoTpv => ({
    id: a.id,
    fechahoraApertura: new Date(a.fechahora_apertura),
    idAgenteApertura: a.agente_apertura_id,
    fechahoraCierre: a.fechahora_cierre ? new Date(a.fechahora_cierre) : null,
    idAgenteCierre: a.agente_cierre_id,
    abierto: a.abierto,
    pagosEfectivo: a.pagos_efectivo,
    pagosTarjeta: a.pagos_tarjeta,
    pagosVale: a.pagos_vale,
    recuentoEfectivo: a.recuento_efectivo,
    recuentoTarjeta: a.recuento_tarjeta,
    recuentoVales: a.recuento_vales,
    recuentoCaja: a.recuento_caja,
    movimientoCierre: a.movimiento_cierre,
    efectivoInicial: a.efectivo_inicial,
});

export const movimientoArqueoDesdeApi = (m: MovimientoArqueoTpvApi): MovimientoArqueoTpv => ({
    id: m.id,
    importe: m.importe,
    fecha: new Date(m.fecha),
    idAgente: m.agente_id,
    agente: m.agente
})

export const arqueoDesdeApi = (a: ArqueoTpvApi): ArqueoTpv => ({
    ...cabeceraArqueoDesdeApi(a),
    movimientos: a.movimientos.map(movimientoArqueoDesdeApi)
});

export const getArqueos: GetArqueosTpv = async (
    filtro: Filtro,
    orden: Orden,
    paginacion: Paginacion
) => {
    const q = criteriaQuery(filtro, orden, paginacion);

    const respuesta = await RestAPI.get<{ datos: CabeceraArqueoTpvApi[]; total: number }>(`${baseUrl}_items` + q);
    return { datos: respuesta.datos.map(cabeceraArqueoDesdeApi), total: respuesta.total };
};

export const getArqueo: GetArqueoTpv = async (id) => {
    return RestAPI.get<{ datos: ArqueoTpvApi }>
        (`${baseUrl}/${id}`)
        .then(
            (respuesta) => arqueoDesdeApi(respuesta.datos)
        );
};

type PagoArqueoTpvAPI = {
    id: string;
    fecha: string;
    importe: number;
    codigo_venta: string;
    forma_pago: string;
    vale: string | null
}

const pagoDesdeAPI = (p: PagoArqueoTpvAPI): PagoArqueoTpv => ({
    id: p.id,
    importe: p.importe,
    formaPago: p.forma_pago,
    fecha: new Date(p.fecha),
    codigoVenta: p.codigo_venta,
    vale: p.vale
});

export const getPagosArqueo: GetPagosArqueoTpv = async (id, criteria) => {

    const url = `${baseUrl}/${id}/pagos` + criteriaAQueryString(criteria);
    const pagosApi = await RestAPI.get<{ datos: PagoArqueoTpvAPI[], total: number }>(url);
    return {
        datos: pagosApi.datos.map(pagoDesdeAPI),
        total: pagosApi.total
    };
}

export const patchRecuentoArqueo: PatchRecuentoArqueo = async (arqueo) => {

    await RestAPI.patch(
        `${baseUrl}/${arqueo.id}`,
        {
            recuento_tarjeta: arqueo.recuentoTarjeta,
            recuento_vales: arqueo.recuentoVales,
            recuento_efectivo: arqueo.recuentoCaja
        },
        "Error al cambiar el arqueo"
    );
}

export const patchArqueo: PatchArqueo = async (anterior, arqueo) => {

    const cambios: {
        agente_apertura_id?: string,
        efectivo_inicial?: number
    } = {};

    if (anterior.idAgenteApertura !== arqueo.idAgenteApertura) {
        cambios["agente_apertura_id"] = arqueo.idAgenteApertura;
    }
    if (anterior.efectivoInicial !== arqueo.efectivoInicial) {
        cambios["efectivo_inicial"] = arqueo.efectivoInicial;
    }

    await RestAPI.patch(
        `${baseUrl}/${arqueo.id}`,
        cambios,
        "Error al cambiar el arqueo"
    );
}

export const patchCerrarArqueo: PatchCerrarArqueo = async (id, cierre) => {

    await RestAPI.patch(
        `${baseUrl}/${id}/cerrar`,
        {
            agente_id: cierre.idAgenteCierre,
            movimiento_cierre: cierre.movimientoCierre
        },
        "Error al cerrar arqueo"
    );
}

export const patchReabrirArqueo: PatchReabrirArqueo = async (id) => {

    await RestAPI.patch(
        `${baseUrl}/${id}/reabrir`,
        {},
        "Error al reabrir arqueo"
    );
}

export const patchCrearMovimiento: PatchCrearMovimiento = async (id, movimiento) => {

    await RestAPI.patch(
        `${baseUrl}/${id}/crear_movimiento`,
        {
            importe: movimiento.importe,
            fecha: movimiento.fecha.toISOString().split("T")[0],
            agente_id: movimiento.idAgente
        },
        "Error al crear movimiento"
    );
}


export const patchBorrarMovimiento: PatchBorrarMovimiento = async (id, idMovimiento) => {

    await RestAPI.patch(
        `${baseUrl}/${id}/borrar_movimiento/${idMovimiento}`,
        {},
        "Error al borrar movimiento"
    );
}

export const postArqueo: PostArqueoTpv = async () => {
    const respuesta = await RestAPI.post(
        baseUrl,
        {
            agente_id: agenteActivo.obtener()?.id,
            punto_venta_id: puntoVentaLocal.obtener()?.id,
        },
        "Error al crear arqueo"
    );
    return respuesta.id;
}

export const deleteArqueoTpv: DeleteArqueoTpv = async (id) => {
    return await RestAPI.delete(`${baseUrl}/${id}`, "Error al borrar el arqueo");
};
