import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { fechaDesdeApi } from "../comun/infraestructura.js";
import ApiUrls from "../comun/urls.js";
import {
    CandidatoConciliacion,
    Conciliacion,
    CuadreBancario,
    CuadreCuenta,
    EncajeCandidato,
    EstadoMovimientoBancario,
    GetCandidatosConciliacion,
    GetConciliacionesMovimientoBancario,
    GetCuadreBancario,
    GetPartidasHuerfanas,
    GetMovimientoBancario,
    GetRemesasConciliacion,
    GetMovimientosBancarios,
    ItemConciliacion,
    MovimientoBancario,
    PartidaHuerfana,
    OrigenConciliacionMovimiento,
    PatchConciliarMovimientoBancario,
    PatchDesconciliarMovimientoBancario,
    PatchIgnorarMovimientoBancario,
    PatchReactivarMovimientoBancario,
    PostSincronizarMovimientoBancario,
    PostConciliarAutomaticamente,
    RemesaCandidata,
    ResumenSincronizacionMovimientoBancario,
    TipoConciliacion,
    TipoReciboMovimiento,
} from "./diseño.js";
import { tTesoreria } from "../i18n/index.ts";

export interface MovimientoBancarioApi {
    id: string;
    conexion_id: string;
    institucion_nombre: string | null;
    cuenta_conexion_id: string;
    nombre_cuenta: string;
    cuenta_banco_id: string | null;
    descripcion_cuenta_banco: string | null;
    id_externo: string;
    fecha: string;
    fecha_valor: string | null;
    importe: number;
    divisa: string | null;
    concepto: string;
    contraparte: string | null;
    referencia: string | null;
    pendiente: boolean;
    estado: EstadoMovimientoBancario;
    num_conciliaciones: number;
    probabilidad_maxima: number | null;
    num_items_conciliacion: number;
    probabilidad: number | null;
    origen_conciliacion: OrigenConciliacionMovimiento | null;
    justificacion: string | null;
    conciliado_por: string | null;
    conciliado_en: string | null;
    eliminado_en_banco: boolean;
    requiere_revision: boolean;
    subcuenta_banco_id: string | null;
    saldo_tras: number | null;
}

export interface CandidatoConciliacionApi {
    tipo_recibo: TipoReciboMovimiento;
    tipo_conciliacion: TipoConciliacion;
    encaje: EncajeCandidato;
    recibo_id: string;
    codigo: string;
    factura_codigo: string | null;
    tercero: string | null;
    id_fiscal: string | null;
    importe: number;
    fecha_vencimiento: string;
    estado: string;
    dias_diferencia: number;
}

interface ReciboConciliacionApi {
    id: string;
    codigo: string;
    tercero: string | null;
    importe: number;
    fecha_vencimiento: string;
    estado: string;
    fecha_emision: string | null;
    fecha_cobro: string | null;
}

interface CuotaConciliacionApi {
    contrato: string | null;
    fecha: string;
    capital: number;
    intereses: number;
    total: number;
}

interface RemesaConciliacionApi {
    id: string;
    fecha_cargo: string;
    total: number;
    estado: string;
    num_recibos: number;
    tipo_remesa?: string | null;
}

interface ItemConciliacionApi {
    tipo: TipoConciliacion;
    params: Record<string, unknown>;
    recibo: ReciboConciliacionApi | null;
    cuota?: CuotaConciliacionApi | null;
    remesa?: RemesaConciliacionApi | null;
    asiento_id?: number | null;
    asiento?: { id: number; numero: string | null; fecha: string; importe: number; concepto?: string | null } | null;
}

export interface RemesaCandidataApi {
    remesa_id: string;
    tipo_conciliacion: TipoConciliacion;
    tipo_remesa?: string | null;
    fecha: string;
    fecha_cargo: string;
    total: number;
    importe_pendiente: number;
    dias_diferencia: number;
    recibos: Array<{ recibo_id: string; codigo: string; tercero: string | null; importe: number }>;
    recibo_ids_propuestos: string[];
    propuesta_ambigua: boolean;
}

export interface ConciliacionApi {
    id: string;
    items: ItemConciliacionApi[];
    probabilidad: number;
    origen: OrigenConciliacionMovimiento;
    justificacion: string | null;
}

interface ConciliarMovimientoBancarioApi {
    conciliacion_id?: string;
    extra_params?: Record<string, unknown>;
    items?: Array<{ tipo: TipoConciliacion; params: Record<string, unknown> }>;
}

interface IgnorarMovimientoBancarioApi {
    motivo?: string;
}

interface ErrorSincronizacionMovimientoBancarioApi {
    conexion_id: string;
    institucion_nombre: string | null;
    error: string;
    requiere_reautenticacion: boolean;
}

interface ResumenSincronizacionMovimientoBancarioApi {
    conexiones: number;
    nuevos: number;
    modificados: number;
    eliminados: number;
    conciliados: number;
    con_candidatos: number;
    conciliados_ia: number;
    con_candidatos_ia: number;
    errores: ErrorSincronizacionMovimientoBancarioApi[];
    errores_conciliacion: string[];
}

interface ResumenConciliacionAutomaticaApi {
    analizados: number;
    conciliados: number;
    con_candidatos: number;
    consultas_ia: number;
    conciliados_ia: number;
    con_candidatos_ia: number;
    errores: string[];
}

const baseUrl = new ApiUrls().MOVIMIENTO_BANCARIO;

/**
 * Mapea la respuesta de API a la interfaz del dominio.
 * `fecha` siempre viene informada (YYYY-MM-DD); el resto de fechas son nullable.
 */
export const movimientoBancarioDesdeApi = (api: MovimientoBancarioApi): MovimientoBancario => ({
    id: api.id,
    conexionId: api.conexion_id,
    institucionNombre: api.institucion_nombre,
    cuentaConexionId: api.cuenta_conexion_id,
    nombreCuenta: api.nombre_cuenta,
    cuentaBancoId: api.cuenta_banco_id,
    descripcionCuentaBanco: api.descripcion_cuenta_banco,
    idExterno: api.id_externo,
    fecha: new Date(Date.parse(api.fecha)),
    fechaValor: fechaDesdeApi(api.fecha_valor),
    importe: api.importe,
    divisa: api.divisa,
    concepto: api.concepto,
    contraparte: api.contraparte,
    referencia: api.referencia,
    pendiente: api.pendiente,
    estado: api.estado,
    numConciliaciones: api.num_conciliaciones ?? 0,
    probabilidadMaxima: api.probabilidad_maxima,
    numItemsConciliacion: api.num_items_conciliacion ?? 0,
    probabilidad: api.probabilidad,
    origenConciliacion: api.origen_conciliacion,
    justificacion: api.justificacion,
    conciliadoPor: api.conciliado_por,
    conciliadoEn: fechaDesdeApi(api.conciliado_en),
    eliminadoEnBanco: api.eliminado_en_banco,
    requiereRevision: api.requiere_revision,
    subcuentaBancoId: api.subcuenta_banco_id ?? null,
    saldo: api.saldo_tras ?? null,
});

export const candidatoConciliacionDesdeApi = (api: CandidatoConciliacionApi): CandidatoConciliacion => ({
    id: `${api.tipo_recibo}_${api.recibo_id}`,
    tipoRecibo: api.tipo_recibo,
    tipoConciliacion: api.tipo_conciliacion,
    encaje: api.encaje,
    reciboId: api.recibo_id,
    codigo: api.codigo,
    facturaCodigo: api.factura_codigo,
    tercero: api.tercero,
    idFiscal: api.id_fiscal,
    importe: api.importe,
    fechaVencimiento: new Date(Date.parse(api.fecha_vencimiento)),
    estado: api.estado,
    diasDiferencia: api.dias_diferencia,
});

export const remesaCandidataDesdeApi = (api: RemesaCandidataApi): RemesaCandidata => ({
    id: api.remesa_id,
    tipoConciliacion: api.tipo_conciliacion,
    tipoRemesa: api.tipo_remesa ?? null,
    fecha: new Date(Date.parse(api.fecha)),
    fechaCargo: new Date(Date.parse(api.fecha_cargo)),
    total: api.total,
    importePendiente: api.importe_pendiente,
    diasDiferencia: api.dias_diferencia,
    recibos: api.recibos.map((recibo) => ({
        reciboId: recibo.recibo_id,
        codigo: recibo.codigo,
        tercero: recibo.tercero,
        importe: recibo.importe,
    })),
    reciboIdsPropuestos: api.recibo_ids_propuestos,
    propuestaAmbigua: api.propuesta_ambigua,
});

const itemConciliacionDesdeApi = (api: ItemConciliacionApi): ItemConciliacion => ({
    tipo: api.tipo,
    params: api.params ?? {},
    recibo: api.recibo
        ? {
            id: api.recibo.id,
            codigo: api.recibo.codigo,
            tercero: api.recibo.tercero,
            importe: api.recibo.importe,
            fechaVencimiento: new Date(Date.parse(api.recibo.fecha_vencimiento)),
            estado: api.recibo.estado,
            fechaEmision: api.recibo.fecha_emision ? new Date(Date.parse(api.recibo.fecha_emision)) : null,
            fechaCobro: api.recibo.fecha_cobro ? new Date(Date.parse(api.recibo.fecha_cobro)) : null,
        }
        : null,
    cuota: api.cuota
        ? {
            contrato: api.cuota.contrato,
            fecha: new Date(Date.parse(api.cuota.fecha)),
            capital: api.cuota.capital,
            intereses: api.cuota.intereses,
            total: api.cuota.total,
        }
        : null,
    remesa: api.remesa
        ? {
            id: api.remesa.id,
            fechaCargo: new Date(Date.parse(api.remesa.fecha_cargo)),
            total: api.remesa.total,
            estado: api.remesa.estado,
            numRecibos: api.remesa.num_recibos,
            tipoRemesa: api.remesa.tipo_remesa ?? null,
        }
        : null,
    asientoId: api.asiento_id ? String(api.asiento_id) : null,
    asiento: api.asiento
        ? {
            id: String(api.asiento.id),
            numero: api.asiento.numero,
            fecha: new Date(Date.parse(api.asiento.fecha)),
            importe: api.asiento.importe,
            concepto: api.asiento.concepto ?? null,
        }
        : null,
});

export const conciliacionDesdeApi = (api: ConciliacionApi): Conciliacion => ({
    id: api.id,
    items: (api.items ?? []).map(itemConciliacionDesdeApi),
    probabilidad: api.probabilidad,
    origen: api.origen,
    justificacion: api.justificacion,
});

const resumenSincronizacionDesdeApi = (
    api: ResumenSincronizacionMovimientoBancarioApi
): ResumenSincronizacionMovimientoBancario => ({
    conexiones: api.conexiones,
    nuevos: api.nuevos,
    modificados: api.modificados,
    eliminados: api.eliminados,
    conciliados: api.conciliados ?? 0,
    conCandidatos: api.con_candidatos ?? 0,
    conciliadosIa: api.conciliados_ia ?? 0,
    conCandidatosIa: api.con_candidatos_ia ?? 0,
    erroresConciliacion: api.errores_conciliacion ?? [],
    errores: (api.errores ?? []).map((error) => ({
        conexionId: error.conexion_id,
        institucionNombre: error.institucion_nombre,
        error: error.error,
        requiereReautenticacion: error.requiere_reautenticacion,
    })),
});

export const getMovimientoBancario: GetMovimientoBancario = async (id) => {
    return await RestAPI.getItem<MovimientoBancario, MovimientoBancarioApi>(
        `${baseUrl}/${id}`,
        movimientoBancarioDesdeApi,
        tTesoreria("conciliacion.errorAlObtenerElMovimientoBancario")
    );
};

export const getMovimientosBancarios: GetMovimientosBancarios = async (criteria) => {
    return await RestAPI.getQuery<MovimientoBancario, MovimientoBancarioApi>(
        baseUrl,
        criteria,
        movimientoBancarioDesdeApi,
        tTesoreria("conciliacion.errorAlObtenerLosMovimientosBancarios")
    );
};

/**
 * Lanza `/transactions/sync` para las conexiones de la cuenta bancaria (con sus otras
 * cuentas, porque el cursor es de la conexión) y concilia automáticamente los movimientos
 * de esa cuenta. Puede tardar varios segundos. Devuelve un resumen aunque alguna conexión
 * individual haya fallado (ver `errores`).
 */
export const postSincronizarMovimientoBancario: PostSincronizarMovimientoBancario = async (cuentaBancoId) => {
    const respuesta = await RestAPI.query<{ cuenta_banco_id: string }, ResumenSincronizacionMovimientoBancarioApi>(
        `${baseUrl}/sincronizar`,
        { cuenta_banco_id: cuentaBancoId },
        tTesoreria("conciliacion.errorAlSincronizarLosMovimientosBancario")
    );
    return resumenSincronizacionDesdeApi(respuesta);
};

/** Aplica las reglas automáticas a los movimientos conciliables de la cuenta bancaria (lo mismo que al sincronizar). */
export const postConciliarAutomaticamente: PostConciliarAutomaticamente = async (cuentaBancoId) => {
    const api = await RestAPI.query<{ cuenta_banco_id: string }, ResumenConciliacionAutomaticaApi>(
        `${baseUrl}/conciliar_automaticamente`,
        { cuenta_banco_id: cuentaBancoId },
        tTesoreria("conciliacion.errorAlConciliarAutomaticamenteLosMovimi")
    );
    return {
        analizados: api.analizados,
        conciliados: api.conciliados,
        conCandidatos: api.con_candidatos ?? 0,
        consultasIa: api.consultas_ia ?? 0,
        conciliadosIa: api.conciliados_ia ?? 0,
        conCandidatosIa: api.con_candidatos_ia ?? 0,
        errores: api.errores ?? [],
    };
};

/**
 * Recibos que el usuario puede elegir a mano: por el importe del movimiento o
 * por más (parcial). `texto` filtra por código de recibo/factura, tercero o
 * NIF; se manda tal cual en la query.
 */
export const getCandidatosConciliacion: GetCandidatosConciliacion = async (id, texto) => {
    const query = texto ? `?texto=${encodeURIComponent(texto)}` : "";
    return await RestAPI.getLista<CandidatoConciliacion, CandidatoConciliacionApi>(
        `${baseUrl}/${id}/candidatos${query}`,
        candidatoConciliacionDesdeApi,
        tTesoreria("conciliacion.errorAlObtenerLosCandidatosDe")
    );
};

/** Remesas de cobro que puede pagar el movimiento, con los recibos propuestos para un pago parcial. */
export const getRemesasConciliacion: GetRemesasConciliacion = async (id) => {
    return await RestAPI.getLista<RemesaCandidata, RemesaCandidataApi>(
        `${baseUrl}/${id}/remesas`,
        remesaCandidataDesdeApi,
        tTesoreria("conciliacion.errorAlObtenerLasRemesasDel")
    );
};

/** Conciliaciones candidatas del movimiento, de más a menos probable. */
export const getConciliacionesMovimientoBancario: GetConciliacionesMovimientoBancario = async (id) => {
    return await RestAPI.getLista<Conciliacion, ConciliacionApi>(
        `${baseUrl}/${id}/conciliaciones`,
        conciliacionDesdeApi,
        tTesoreria("conciliacion.errorAlObtenerLasConciliacionesDel")
    );
};

/** Conciliación aplicada de un movimiento conciliado (datos actuales del recibo/cuota). */
export const getConciliacionAplicadaMovimientoBancario = async (id: string): Promise<Conciliacion | null> => {
    const resp = await RestAPI.getItem<ConciliacionApi | null, ConciliacionApi | null>(
        `${baseUrl}/${id}/conciliacion_aplicada`,
        (api) => api,
        tTesoreria("conciliacion.errorAlObtenerLaConciliacionAplicada")
    );
    return resp ? conciliacionDesdeApi(resp) : null;
};

/**
 * Resuelve la casación en el servidor (paga el recibo, lo divide, genera el
 * asiento...) con la fecha del movimiento y lo deja conciliado.
 */
export const patchConciliarMovimientoBancario: PatchConciliarMovimientoBancario = async (id, conciliacion) => {
    const cuerpo: ConciliarMovimientoBancarioApi = "conciliacionId" in conciliacion
        ? {
            conciliacion_id: conciliacion.conciliacionId,
            ...(conciliacion.extraParams && { extra_params: conciliacion.extraParams }),
        }
        : {
            items: conciliacion.items.map(({ tipo, params }) => ({ tipo, params })),
        };
    await RestAPI.patch<ConciliarMovimientoBancarioApi>(
        `${baseUrl}/${id}/conciliar`,
        cuerpo,
        tTesoreria("conciliacion.errorAlConciliarElMovimiento")
    );
};

/** Deshace la casación y deja el movimiento pendiente (puede llegar a borrarlo, ver detalle.ts). */
export const patchDesconciliarMovimientoBancario: PatchDesconciliarMovimientoBancario = async (id) => {
    await RestAPI.patch(`${baseUrl}/${id}/desconciliar`, {}, tTesoreria("conciliacion.errorAlDesconciliarElMovimiento"));
};

export const patchIgnorarMovimientoBancario: PatchIgnorarMovimientoBancario = async (id, motivo) => {
    await RestAPI.patch<IgnorarMovimientoBancarioApi>(
        `${baseUrl}/${id}/ignorar`,
        motivo ? { motivo } : {},
        tTesoreria("conciliacion.errorAlIgnorarElMovimiento")
    );
};

export const patchReactivarMovimientoBancario: PatchReactivarMovimientoBancario = async (id) => {
    await RestAPI.patch(`${baseUrl}/${id}/reactivar`, {}, tTesoreria("conciliacion.errorAlReactivarElMovimiento"));
};

interface CuadreCuentaApi {
    cuenta_id: string;
    cuenta_banco_id: string;
    nombre_cuenta: string;
    institucion: string | null;
    ultima_sincronizacion: string | null;
    saldo_banco: number | null;
    saldo_contable: number | null;
    diferencia: number | null;
    bancario_sin_conciliar: number;
    importe_sin_conciliar: number;
    bancario_ignorado: number;
    importe_ignorado: number;
    requiere_revision: number;
    banco_elimino_conciliado: number;
    asiento_descuadrado: number;
    partida_huerfana: number;
    total_alertas: number;
}

interface CuadreBancarioApi {
    cuentas: CuadreCuentaApi[];
}

const cuadreCuentaDesdeApi = (api: CuadreCuentaApi): CuadreCuenta => ({
    cuentaId: api.cuenta_id,
    cuentaBancoId: api.cuenta_banco_id,
    nombreCuenta: api.nombre_cuenta,
    institucion: api.institucion,
    ultimaSincronizacion: fechaDesdeApi(api.ultima_sincronizacion),
    saldoBanco: api.saldo_banco,
    saldoContable: api.saldo_contable,
    diferencia: api.diferencia,
    bancarioSinConciliar: api.bancario_sin_conciliar,
    importeSinConciliar: api.importe_sin_conciliar,
    bancarioIgnorado: api.bancario_ignorado,
    importeIgnorado: api.importe_ignorado,
    requiereRevision: api.requiere_revision,
    bancoEliminoConciliado: api.banco_elimino_conciliado,
    asientoDescuadrado: api.asiento_descuadrado,
    partidaHuerfana: api.partida_huerfana,
    totalAlertas: api.total_alertas,
});

const cuadreBancarioUrl = new ApiUrls().CUADRE_BANCARIO;

export const getCuadreBancario: GetCuadreBancario = async () => {
    const api = await RestAPI.getItem<CuadreBancarioApi, CuadreBancarioApi>(
        cuadreBancarioUrl,
        (a) => a,
        tTesoreria("conciliacion.errorAlObtenerElCuadreBancario")
    );
    return {
        cuentas: (api.cuentas ?? []).map(cuadreCuentaDesdeApi),
    } satisfies CuadreBancario;
};

interface PartidaHuerfanaApi {
    idasiento: number;
    fecha: string;
    importe: number;
    descripcion: string | null;
    numero_asiento: string | null;
}

const partidaHuerfanaDesdeApi = (api: PartidaHuerfanaApi): PartidaHuerfana => ({
    idasiento: api.idasiento,
    fecha: new Date(Date.parse(api.fecha)),
    importe: api.importe,
    descripcion: api.descripcion,
    numeroAsiento: api.numero_asiento,
});

export const getPartidasHuerfanas: GetPartidasHuerfanas = async (cuentaConexionId) => {
    return await RestAPI.getLista<PartidaHuerfana, PartidaHuerfanaApi>(
        `${cuadreBancarioUrl}/${cuentaConexionId}/partidas_huerfanas`,
        partidaHuerfanaDesdeApi,
        tTesoreria("conciliacion.errorAlObtenerLasPartidasHuerfanas")
    );
};
