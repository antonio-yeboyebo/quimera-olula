import ApiUrls from "#/contabilidad/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    BalanceCuentasAnuales,
    CambiosCuentasAnuales,
    CuentasAnuales,
    DeleteCuentasAnuales,
    FormatoHoja,
    GetBalanceCuentasAnuales,
    GetCuentasAnuales,
    GetHojaCuentasAnuales,
    GetListaCuentasAnuales,
    GetReportCuentasAnuales,
    NuevaCuentasAnuales,
    PatchCuentasAnuales,
    PostCuentasAnuales,
    TipoFilaInforme,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

const urls = new ApiUrls();
const baseUrl = urls.CUENTAS_ANUALES;

interface PeriodoApi {
    ejercicio_id: string;
    fecha_desde: string | null;
    fecha_hasta: string | null;
}

export interface CuentasAnualesApi {
    id: number;
    descripcion: string;
    tipo: string;
    formato: string;
    nivel_desglose: string;
    periodo: PeriodoApi;
    periodo_anterior: PeriodoApi | null;
    omitir_epigrafes_sin_saldo: boolean;
}

export const cuentasAnualesDesdeApi = (
    api: CuentasAnualesApi
): CuentasAnuales => ({
    id: String(api.id),
    descripcion: api.descripcion,
    tipo: api.tipo as CuentasAnuales["tipo"],
    formato: api.formato as CuentasAnuales["formato"],
    nivelDesglose: api.nivel_desglose as CuentasAnuales["nivelDesglose"],
    ejercicioId: api.periodo.ejercicio_id,
    fechaDesde: api.periodo.fecha_desde ?? "",
    fechaHasta: api.periodo.fecha_hasta ?? "",
    ejercicioAnteriorId: api.periodo_anterior?.ejercicio_id ?? "",
    fechaDesdeAnterior: api.periodo_anterior?.fecha_desde ?? "",
    fechaHastaAnterior: api.periodo_anterior?.fecha_hasta ?? "",
    omitirEpigrafesSinSaldo: api.omitir_epigrafes_sin_saldo,
});

interface LineaApi {
    codbalance: string;
    naturaleza: string;
    nivel1: string;
    nivel2: number | null;
    descripcion1: string;
    descripcion2: string;
    descripcion3: string;
    descripcion4: string;
    saldo_actual: number;
    saldo_anterior: number;
    desglose?: {
        clave: string;
        descripcion: string;
        saldo_actual: number;
        saldo_anterior: number;
    }[];
}

export interface BalanceCuentasAnualesApi {
    datos: LineaApi[];
    total: number;
    subtotales: {
        codigo: string;
        descripcion: string;
        saldo_actual: number;
        saldo_anterior: number;
        despues_de_nivel2: number;
    }[];
    totales_grupo: {
        clave: string;
        descripcion: string;
        saldo_actual: number;
        saldo_anterior: number;
    }[];
    avisos_sin_codigo_balance: {
        codigo_subcuenta: string;
        codigo_cuenta: string;
        debe: number;
        haber: number;
    }[];
    filas?: {
        tipo: TipoFilaInforme;
        nivel: number;
        concepto: string;
        saldo_actual: number | null;
        saldo_anterior: number | null;
        negrita?: boolean;
    }[];
}

/** Si el servidor no dice la negrita (versiones anteriores), la deciden los tipos. */
export const NEGRITA_POR_TIPO: TipoFilaInforme[] = ["cabecera", "subtotal", "total"];

export const balanceDesdeApi = (
    api: BalanceCuentasAnualesApi
): BalanceCuentasAnuales => ({
    datos: api.datos.map((l) => ({
        codbalance: l.codbalance,
        naturaleza: l.naturaleza,
        nivel1: l.nivel1,
        nivel2: l.nivel2,
        descripcion1: l.descripcion1,
        descripcion2: l.descripcion2,
        descripcion3: l.descripcion3,
        descripcion4: l.descripcion4,
        saldoActual: l.saldo_actual,
        saldoAnterior: l.saldo_anterior,
        desglose: (l.desglose ?? []).map((d) => ({
            clave: d.clave,
            descripcion: d.descripcion,
            saldoActual: d.saldo_actual,
            saldoAnterior: d.saldo_anterior,
        })),
    })),
    total: api.total,
    subtotales: api.subtotales.map((s) => ({
        codigo: s.codigo,
        descripcion: s.descripcion,
        saldoActual: s.saldo_actual,
        saldoAnterior: s.saldo_anterior,
        despuesDeNivel2: s.despues_de_nivel2,
    })),
    totalesGrupo: api.totales_grupo.map((t) => ({
        clave: t.clave,
        descripcion: t.descripcion,
        saldoActual: t.saldo_actual,
        saldoAnterior: t.saldo_anterior,
    })),
    ...(api.filas && {
        filas: api.filas.map((f) => ({
            tipo: f.tipo,
            nivel: f.nivel,
            concepto: f.concepto,
            saldoActual: f.saldo_actual,
            saldoAnterior: f.saldo_anterior,
            negrita: f.negrita ?? NEGRITA_POR_TIPO.includes(f.tipo),
        })),
    }),
    avisosSinCodigoBalance: api.avisos_sin_codigo_balance.map((a) => ({
        codigoSubcuenta: a.codigo_subcuenta,
        codigoCuenta: a.codigo_cuenta,
        debe: a.debe,
        haber: a.haber,
    })),
});

export const getListaCuentasAnuales: GetListaCuentasAnuales = async (criteria) =>
    RestAPI.getQuery<CuentasAnuales, CuentasAnualesApi>(
        baseUrl,
        criteria,
        cuentasAnualesDesdeApi
    );

export const getCuentasAnuales: GetCuentasAnuales = async (id) =>
    RestAPI.getItem<CuentasAnuales, CuentasAnualesApi>(
        `${baseUrl}/${id}`,
        cuentasAnualesDesdeApi
    );

export const getBalanceCuentasAnuales: GetBalanceCuentasAnuales = async (id) =>
    RestAPI.getItem<BalanceCuentasAnuales, BalanceCuentasAnualesApi>(
        urls.CUENTAS_ANUALES_BALANCE(id),
        balanceDesdeApi,
        tContabilidad("cuentas_anuales.errorAlCalcularLasCuentasAnuales")
    );

const periodoAApi = (
    ejercicioId: string,
    fechaDesde: string,
    fechaHasta: string
) => ({
    ejercicio_id: ejercicioId,
    fecha_desde: fechaDesde || null,
    fecha_hasta: fechaHasta || null,
});

export const nuevaCuentasAnualesAApi = (nuevo: NuevaCuentasAnuales) => ({
    descripcion: nuevo.descripcion,
    tipo: nuevo.tipo,
    formato: nuevo.formato,
    nivel_desglose: nuevo.nivelDesglose,
    periodo: periodoAApi(
        nuevo.ejercicioId,
        nuevo.fechaDesde,
        nuevo.fechaHasta
    ),
    periodo_anterior: nuevo.ejercicioAnteriorId
        ? periodoAApi(
              nuevo.ejercicioAnteriorId,
              nuevo.fechaDesdeAnterior,
              nuevo.fechaHastaAnterior
          )
        : null,
});

export const postCuentasAnuales: PostCuentasAnuales = async (nuevo) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        nuevaCuentasAnualesAApi(nuevo),
        tContabilidad("cuentas_anuales.errorAlCrearElInformeDe")
    );
    return String(respuesta.id);
};

/**
 * Los tres campos de cada periodo viajan juntos aunque solo cambie uno: la API
 * recibe el periodo como objeto completo, no campo a campo. `guardarInforme`
 * los manda siempre los tres.
 */
export const cambiosCuentasAnualesAApi = (cambios: CambiosCuentasAnuales) => {
    const api: Record<string, unknown> = {};
    if (cambios.descripcion !== undefined) api.descripcion = cambios.descripcion;
    if (cambios.tipo !== undefined) api.tipo = cambios.tipo;
    if (cambios.formato !== undefined) api.formato = cambios.formato;
    if (cambios.nivelDesglose !== undefined)
        api.nivel_desglose = cambios.nivelDesglose;
    if (cambios.omitirEpigrafesSinSaldo !== undefined)
        api.omitir_epigrafes_sin_saldo = cambios.omitirEpigrafesSinSaldo;
    if (cambios.ejercicioId !== undefined)
        api.periodo = periodoAApi(
            cambios.ejercicioId,
            cambios.fechaDesde ?? "",
            cambios.fechaHasta ?? ""
        );
    if (cambios.ejercicioAnteriorId !== undefined)
        api.periodo_anterior = cambios.ejercicioAnteriorId
            ? periodoAApi(
                  cambios.ejercicioAnteriorId,
                  cambios.fechaDesdeAnterior ?? "",
                  cambios.fechaHastaAnterior ?? ""
              )
            : null;
    return api;
};

export const patchCuentasAnuales: PatchCuentasAnuales = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        cambiosCuentasAnualesAApi(cambios),
        tContabilidad("cuentas_anuales.errorAlGuardarElInformeDe")
    );
};

export const deleteCuentasAnuales: DeleteCuentasAnuales = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        tContabilidad("cuentas_anuales.errorAlBorrarElInformeDe")
    );
};

export const getReportCuentasAnuales: GetReportCuentasAnuales = async (id) =>
    RestAPI.blob(
        urls.CUENTAS_ANUALES_REPORT(id),
        tContabilidad("cuentas_anuales.errorAlDescargarElPdfDe")
    );

export const getHojaCuentasAnuales: GetHojaCuentasAnuales = async (
    id,
    formato: FormatoHoja
) =>
    RestAPI.blob(
        urls.CUENTAS_ANUALES_HOJA(id, formato),
        tContabilidad("cuentas_anuales.errorAlDescargarLaHojaDe")
    );
