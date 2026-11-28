import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { fechaDesdeApi } from "../comun/infraestructura.js";
import ApiUrls from "../comun/urls.js";
import {
    AmortizacionPrestamo,
    ConexionBancaria,
    CuentaConexionBancaria,
    DeleteConexionBancaria,
    EstadoConexionBancaria,
    GetConexionBancaria,
    GetConexionesBancarias,
    GetPrestamoBancario,
    GetPrestamosBancarios,
    GetSaldosConexionBancaria,
    PatchCuentaConexionBancaria,
    PatchPrestamoBancario,
    PatchReautenticarConexionBancaria,
    PatchTiposProductoConexionBancaria,
    PostConexionBancaria,
    PostIniciarConexionBancaria,
    PrestamoBancario,
    ProveedorConexionBancaria,
    ResumenSaldosConexionBancaria,
    SaldoCuentaConexionBancaria,
    TipoProductoBancario,
} from "./diseño.js";
import { tTesoreria } from "../i18n/index.ts";

export interface CuentaConexionBancariaApi {
    id: string;
    id_externo: string;
    nombre: string;
    mascara: string | null;
    tipo: string | null;
    subtipo: string | null;
    iban: string | null;
    cuenta_banco_id: string | null;
    descripcion_cuenta_banco: string | null;
    activa: boolean;
}

interface CambiosCuentaConexionBancariaApi {
    cuenta_banco_id: string | null;
    activa: boolean;
}

export interface ConexionBancariaApi {
    id: string;
    proveedor: ProveedorConexionBancaria;
    institucion_id: string | null;
    institucion_nombre: string | null;
    estado: EstadoConexionBancaria;
    tipos_producto: TipoProductoBancario[];
    ultima_sincronizacion: string | null;
    ultimo_error: string | null;
    creado_en: string;
    cuentas: CuentaConexionBancariaApi[];
}

interface AmortizacionPrestamoApi {
    id: string;
    fecha: string;
    capital: number;
    intereses: number;
    total: number;
    capital_pendiente: number | null;
    programada: boolean;
    asiento_id: number | null;
}

export interface PrestamoBancarioApi {
    id: string;
    conexion_id: string;
    cuenta_conexion_id: string;
    nombre: string;
    activa: boolean;
    contrato: string | null;
    tipo: string | null;
    divisa: string | null;
    capital_concedido: number | null;
    capital_pendiente: number | null;
    cuota: number | null;
    cuenta_vinculada: string | null;
    codigo_subcuenta_capital: string | null;
    codigo_subcuenta_intereses: string | null;
    cuotas_sin_contabilizar: number;
    amortizaciones?: AmortizacionPrestamoApi[];
}

interface IniciarConexionBancariaApi {
    proveedor: string;
    datos: Record<string, unknown>;
}

const baseUrl = new ApiUrls().CONEXION_BANCARIA;

const cuentaConexionBancariaDesdeApi = (api: CuentaConexionBancariaApi): CuentaConexionBancaria => ({
    id: api.id,
    idExterno: api.id_externo,
    nombre: api.nombre,
    mascara: api.mascara,
    tipo: api.tipo,
    subtipo: api.subtipo,
    iban: api.iban,
    cuentaBancoId: api.cuenta_banco_id,
    descripcionCuentaBanco: api.descripcion_cuenta_banco,
    activa: api.activa,
});

export const conexionBancariaDesdeApi = (api: ConexionBancariaApi): ConexionBancaria => ({
    id: api.id,
    proveedor: api.proveedor,
    institucionId: api.institucion_id,
    institucionNombre: api.institucion_nombre,
    estado: api.estado,
    tiposProducto: api.tipos_producto ?? ["accounts"],
    ultimaSincronizacion: fechaDesdeApi(api.ultima_sincronizacion),
    ultimoError: api.ultimo_error,
    creadoEn: new Date(api.creado_en),
    cuentas: (api.cuentas ?? []).map(cuentaConexionBancariaDesdeApi),
});

export const getConexionBancaria: GetConexionBancaria = async (id) => {
    return await RestAPI.getItem<ConexionBancaria, ConexionBancariaApi>(
        `${baseUrl}/${id}`,
        conexionBancariaDesdeApi,
        tTesoreria("conexion_bancaria.errorAlObtenerLaConexionBancaria")
    );
};

export const getConexionesBancarias: GetConexionesBancarias = async (criteria) => {
    return await RestAPI.getQuery<ConexionBancaria, ConexionBancariaApi>(
        baseUrl,
        criteria,
        conexionBancariaDesdeApi,
        tTesoreria("conexion_bancaria.errorAlObtenerLasConexionesBancarias")
    );
};

/**
 * Pide al backend los datos para iniciar la conexión con el proveedor activo
 * (para Plaid, un `link_token` de un solo uso). Con `conexionId`, pide los
 * datos para reautenticar esa conexión en concreto en vez de crear una nueva.
 */
export const postIniciarConexionBancaria: PostIniciarConexionBancaria = async (conexionId, tiposProducto) => {
    const respuesta = await RestAPI.query<
        { id?: string; tipos_producto?: TipoProductoBancario[]; origen?: string },
        IniciarConexionBancariaApi
    >(
        `${baseUrl}/iniciar`,
        {
            ...(conexionId ? { id: conexionId } : {}),
            ...(tiposProducto ? { tipos_producto: tiposProducto } : {}),
            // Wealth Reader autoriza el widget por este origin; si ≠ API lo registra.
            origen: window.location.origin,
        },
        tTesoreria("conexion_bancaria.errorAlIniciarLaConexionCon")
    );
    return { proveedor: respuesta.proveedor, datos: respuesta.datos };
};

export const patchReautenticarConexionBancaria: PatchReautenticarConexionBancaria = async (id, datos) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/reautenticar`,
        { datos },
        tTesoreria("conexion_bancaria.errorAlReautenticarLaConexionBancaria")
    );
};

export const postConexionBancaria: PostConexionBancaria = async (datos) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        { datos },
        tTesoreria("conexion_bancaria.errorAlConectarElBanco")
    );
    return respuesta.id;
};

export const patchCuentaConexionBancaria: PatchCuentaConexionBancaria = async (conexionId, cuentaId, cambios) => {
    await RestAPI.patch<CambiosCuentaConexionBancariaApi>(
        `${baseUrl}/${conexionId}/cuenta/${cuentaId}`,
        { cuenta_banco_id: cambios.cuentaBancoId, activa: cambios.activa },
        tTesoreria("conexion_bancaria.errorAlAsociarLaCuentaBancaria")
    );
};

export const deleteConexionBancaria: DeleteConexionBancaria = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        tTesoreria("conexion_bancaria.errorAlDesconectarElBanco")
    );
};

interface SaldoCuentaConexionBancariaApi {
    cuenta_id: string;
    id_externo: string;
    nombre: string;
    mascara: string | null;
    tipo: string | null;
    subtipo: string | null;
    iban: string | null;
    cuenta_banco_id: string | null;
    descripcion_cuenta_banco: string | null;
    activa: boolean;
    saldo_disponible: number | null;
    saldo_actual: number | null;
    saldo_limite: number | null;
    divisa: string | null;
    conexion_id: string;
    institucion_nombre: string | null;
    estado_conexion: EstadoConexionBancaria;
    consentimiento_caduca_en: string | null;
    ultima_sincronizacion: string | null;
    saldo_actualizado_en: string | null;
    error: string | null;
}

interface ResumenSaldosConexionBancariaApi {
    cuentas: SaldoCuentaConexionBancariaApi[];
    total_disponible: number | null;
    total_actual: number | null;
    divisa: string | null;
    conexiones: number;
    conexiones_con_error: number;
    conexiones_requieren_reautenticacion: number;
    necesita_refresco: boolean;
}

const saldoCuentaDesdeApi = (api: SaldoCuentaConexionBancariaApi): SaldoCuentaConexionBancaria => ({
    cuentaId: api.cuenta_id,
    idExterno: api.id_externo,
    nombre: api.nombre,
    mascara: api.mascara,
    tipo: api.tipo,
    subtipo: api.subtipo,
    iban: api.iban,
    cuentaBancoId: api.cuenta_banco_id,
    descripcionCuentaBanco: api.descripcion_cuenta_banco,
    activa: api.activa,
    saldoDisponible: api.saldo_disponible,
    saldoActual: api.saldo_actual,
    saldoLimite: api.saldo_limite,
    divisa: api.divisa,
    conexionId: api.conexion_id,
    institucionNombre: api.institucion_nombre,
    estadoConexion: api.estado_conexion,
    consentimientoCaducaEn: fechaDesdeApi(api.consentimiento_caduca_en),
    ultimaSincronizacion: fechaDesdeApi(api.ultima_sincronizacion),
    saldoActualizadoEn: fechaDesdeApi(api.saldo_actualizado_en),
    error: api.error,
});

/**
 * Saldos cacheados en BD (rápido). Si están caducados, el backend lanza
 * refresco en segundo plano; el cliente puede reconsultar con `necesitaRefresco`.
 */
export const getSaldosConexionBancaria: GetSaldosConexionBancaria = async () => {
    const api = await RestAPI.get<ResumenSaldosConexionBancariaApi>(
        `${baseUrl}/saldos`,
        tTesoreria("conexion_bancaria.errorAlObtenerLosSaldosDe")
    );
    return {
        cuentas: (api.cuentas ?? []).map(saldoCuentaDesdeApi),
        totalDisponible: api.total_disponible,
        totalActual: api.total_actual,
        divisa: api.divisa,
        conexiones: api.conexiones,
        conexionesConError: api.conexiones_con_error,
        conexionesRequierenReautenticacion: api.conexiones_requieren_reautenticacion,
        necesitaRefresco: Boolean(api.necesita_refresco),
    } satisfies ResumenSaldosConexionBancaria;
};

export const patchTiposProductoConexionBancaria: PatchTiposProductoConexionBancaria = async (id, tiposProducto) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/tipos_producto`,
        { tipos_producto: tiposProducto },
        tTesoreria("conexion_bancaria.errorAlCambiarLosProductosDe")
    );
};

const amortizacionDesdeApi = (api: AmortizacionPrestamoApi): AmortizacionPrestamo => ({
    id: api.id,
    fecha: new Date(Date.parse(api.fecha)),
    capital: api.capital,
    intereses: api.intereses,
    total: api.total,
    capitalPendiente: api.capital_pendiente,
    programada: api.programada,
    asientoId: api.asiento_id,
});

export const prestamoBancarioDesdeApi = (api: PrestamoBancarioApi): PrestamoBancario => ({
    id: api.id,
    conexionId: api.conexion_id,
    cuentaConexionId: api.cuenta_conexion_id,
    nombre: api.nombre,
    activa: api.activa,
    contrato: api.contrato,
    tipo: api.tipo,
    divisa: api.divisa,
    capitalConcedido: api.capital_concedido,
    capitalPendiente: api.capital_pendiente,
    cuota: api.cuota,
    cuentaVinculada: api.cuenta_vinculada,
    codigoSubcuentaCapital: api.codigo_subcuenta_capital,
    codigoSubcuentaIntereses: api.codigo_subcuenta_intereses,
    cuotasSinContabilizar: api.cuotas_sin_contabilizar,
    amortizaciones: (api.amortizaciones ?? []).map(amortizacionDesdeApi),
});

const urlPrestamos = new ApiUrls().PRESTAMO_BANCARIO;

export const getPrestamosBancarios: GetPrestamosBancarios = async (conexionId) => {
    return await RestAPI.getLista<PrestamoBancario, PrestamoBancarioApi>(
        `${urlPrestamos}?conexion_id=${encodeURIComponent(conexionId)}`,
        prestamoBancarioDesdeApi,
        tTesoreria("conexion_bancaria.errorAlObtenerLosPrestamosDe")
    );
};

export const getPrestamoBancario: GetPrestamoBancario = async (id) => {
    return await RestAPI.getItem<PrestamoBancario, PrestamoBancarioApi>(
        `${urlPrestamos}/${id}`,
        prestamoBancarioDesdeApi,
        tTesoreria("conexion_bancaria.errorAlObtenerElPrestamo")
    );
};

export const patchPrestamoBancario: PatchPrestamoBancario = async (id, subcuentas) => {
    await RestAPI.patch(
        `${urlPrestamos}/${id}`,
        {
            codigo_subcuenta_capital: subcuentas.codigoSubcuentaCapital,
            codigo_subcuenta_intereses: subcuentas.codigoSubcuentaIntereses,
        },
        tTesoreria("conexion_bancaria.errorAlGuardarLasSubcuentasDel")
    );
};
