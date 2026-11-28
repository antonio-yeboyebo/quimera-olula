import ApiUrls from "#/contabilidad/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import {
    Amortizacion,
    CambiosAmortizacion,
    CuentaInforme,
    Dotacion,
    FiltroInforme,
    GetAmortizacion,
    GetAmortizaciones,
    InformeAmortizaciones,
    LineaInforme,
    NuevaAmortizacion,
    NuevaDotacion,
    NuevaRegularizacionValor,
    PartidaCompra,
    RegularizacionValor,
    ResultadoGeneracion,
    ValoresInforme,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

const urls = new ApiUrls();
const baseUrl = urls.AMORTIZACION;
const urlAmortizacion = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;

const dosCifras = (n: number): string => String(n).padStart(2, "0");

/** Fecha local a `AAAA-MM-DD` sin pasar por UTC. */
export const fechaAApi = (fecha: Date): string =>
    `${fecha.getFullYear()}-${dosCifras(fecha.getMonth() + 1)}-${dosCifras(fecha.getDate())}`;

export const fechaDesdeApi = (fecha: string): Date => new Date(`${fecha}T12:00:00`);

const fechaODesdeApi = (fecha: string | null): Date | null => (fecha ? fechaDesdeApi(fecha) : null);

export interface AmortizacionApi {
    id: string;
    elemento: string;
    estado: string;
    fecha: string;
    fecha_inicio: string;
    valor_adquisicion: number;
    valor_residual: number;
    valor_amortizable: number;
    metodo: string;
    periodo: string;
    porcentaje_periodo: number;
    porcentaje_anual: number;
    num_periodos: number;
    amortizacion_periodo: number;
    amortizacion_primer_periodo: number;
    amortizacion_ultimo_periodo: number;
    total_amortizado: number;
    pendiente: number;
    grupo_id: string;
    descripcion_grupo: string | null;
    bloqueado: boolean;
    no_generar_asiento_cierre: boolean;
    fecha_cierre: string | null;
    asiento_cierre_id: number | null;
    numero_asiento_cierre: number | null;
    ejercicio_asiento_cierre: string | null;
    vendido: boolean;
    factura_venta_id: number | null;
    codigo_factura_venta: string | null;
    notas: string | null;
}

export const amortizacionDesdeApi = (api: AmortizacionApi): Amortizacion => ({
    id: api.id,
    elemento: api.elemento ?? "",
    estado: api.estado ?? "",
    fecha: fechaDesdeApi(api.fecha),
    fechaInicio: fechaDesdeApi(api.fecha_inicio || api.fecha),
    valorAdquisicion: api.valor_adquisicion,
    valorResidual: api.valor_residual,
    valorAmortizable: api.valor_amortizable,
    metodo: api.metodo ?? "Lineal",
    periodo: api.periodo ?? "Anual",
    porcentajePeriodo: api.porcentaje_periodo,
    porcentajeAnual: api.porcentaje_anual,
    numPeriodos: api.num_periodos,
    amortizacionPeriodo: api.amortizacion_periodo,
    amortizacionPrimerPeriodo: api.amortizacion_primer_periodo,
    amortizacionUltimoPeriodo: api.amortizacion_ultimo_periodo,
    totalAmortizado: api.total_amortizado,
    pendiente: api.pendiente,
    grupoId: api.grupo_id ?? "",
    descripcionGrupo: api.descripcion_grupo ?? "",
    bloqueado: api.bloqueado,
    noGenerarAsientoCierre: api.no_generar_asiento_cierre,
    fechaCierre: fechaODesdeApi(api.fecha_cierre),
    asientoCierreId: api.asiento_cierre_id === null ? null : String(api.asiento_cierre_id),
    numeroAsientoCierre: api.numero_asiento_cierre,
    ejercicioAsientoCierre: api.ejercicio_asiento_cierre ?? "",
    vendido: api.vendido,
    facturaVentaId: api.factura_venta_id,
    codigoFacturaVenta: api.codigo_factura_venta ?? "",
    notas: api.notas ?? "",
});

const CAMPOS_API: Record<keyof CambiosAmortizacion, string> = {
    elemento: "elemento",
    grupoId: "grupo_id",
    fecha: "fecha",
    fechaInicio: "fecha_inicio",
    valorAdquisicion: "valor_adquisicion",
    valorResidual: "valor_residual",
    periodo: "periodo",
    porcentajeAnual: "porcentaje_anual",
    porcentajePeriodo: "porcentaje_periodo",
    amortizacionPeriodo: "amortizacion_periodo",
    numPeriodos: "num_periodos",
    bloqueado: "bloqueado",
    noGenerarAsientoCierre: "no_generar_asiento_cierre",
    vendido: "vendido",
    notas: "notas",
};

export const cambiosAmortizacionAApi = (cambios: CambiosAmortizacion) => {
    const api: Record<string, string | number | boolean | null> = {};
    for (const [campo, campoApi] of Object.entries(CAMPOS_API)) {
        const valor = cambios[campo as keyof CambiosAmortizacion];
        if (valor === undefined) continue;
        api[campoApi] = valor instanceof Date ? fechaAApi(valor) : (valor as string | number | boolean | null);
    }
    return api;
};

export const nuevaAmortizacionAApi = (nueva: NuevaAmortizacion) => {
    const { id, ...resto } = nueva;
    return {
        ...(id.trim() ? { id: id.trim() } : {}),
        ...cambiosAmortizacionAApi(resto as CambiosAmortizacion),
    };
};

export interface DotacionApi {
    id: number;
    amortizacion_id: string;
    fecha_inicio: string;
    fecha_fin: string;
    fecha: string;
    importe: number;
    porcentaje: number;
    acumulado: number;
    resto: number;
    asiento_id: number | null;
    numero_asiento: number | null;
    ejercicio_asiento: string | null;
    no_generar_asiento: boolean;
}

export const dotacionDesdeApi = (api: DotacionApi): Dotacion => ({
    id: String(api.id),
    amortizacionId: api.amortizacion_id,
    fechaInicio: fechaDesdeApi(api.fecha_inicio),
    fechaFin: fechaDesdeApi(api.fecha_fin),
    fecha: fechaDesdeApi(api.fecha),
    importe: api.importe,
    porcentaje: api.porcentaje,
    acumulado: api.acumulado,
    resto: api.resto,
    asientoId: api.asiento_id === null ? null : String(api.asiento_id),
    numeroAsiento: api.numero_asiento,
    ejercicioAsiento: api.ejercicio_asiento ?? "",
    noGenerarAsiento: api.no_generar_asiento,
});

export interface RegularizacionValorApi {
    id: number;
    amortizacion_id: string;
    fecha: string;
    descripcion: string | null;
    importe: number;
}

export const regularizacionDesdeApi = (api: RegularizacionValorApi): RegularizacionValor => ({
    id: String(api.id),
    amortizacionId: api.amortizacion_id,
    fecha: fechaDesdeApi(api.fecha),
    descripcion: api.descripcion ?? "",
    importe: api.importe,
});

export interface PartidaCompraApi {
    id: number;
    asiento_id: number;
    fecha: string;
    codigo_subcuenta: string;
    concepto: string | null;
    debe: number;
    haber: number;
    factura_id: number;
    codigo_factura: string | null;
    nombre_proveedor: string | null;
}

export const partidaCompraDesdeApi = (api: PartidaCompraApi): PartidaCompra => ({
    id: String(api.id),
    asientoId: String(api.asiento_id),
    fecha: fechaDesdeApi(api.fecha),
    codigoSubcuenta: api.codigo_subcuenta,
    concepto: api.concepto ?? "",
    debe: api.debe,
    facturaId: String(api.factura_id),
    codigoFactura: api.codigo_factura ?? "",
    nombreProveedor: api.nombre_proveedor ?? "",
});

type ValoresInformeApi = {
    coste_inicio: number; adicion: number; venta: number; coste_fin: number;
    amortizacion_inicio: number; amortizacion_periodo: number;
    venta_amortizacion_periodo: number; amortizacion_fin: number;
    valor_inicio: number; valor_fin: number;
};

export interface InformeAmortizacionesApi {
    ejercicio_id: string;
    fecha_inicio: string;
    fecha_fin: string;
    cuentas: {
        codigo_cuenta: string;
        descripcion: string | null;
        lineas: (ValoresInformeApi & { amortizacion_id: string; elemento: string })[];
        total: ValoresInformeApi;
    }[];
    total: ValoresInformeApi;
}

const valoresDesdeApi = (api: ValoresInformeApi): ValoresInforme => ({
    costeInicio: api.coste_inicio,
    adicion: api.adicion,
    venta: api.venta,
    costeFin: api.coste_fin,
    amortizacionInicio: api.amortizacion_inicio,
    amortizacionPeriodo: api.amortizacion_periodo,
    ventaAmortizacionPeriodo: api.venta_amortizacion_periodo,
    amortizacionFin: api.amortizacion_fin,
    valorInicio: api.valor_inicio,
    valorFin: api.valor_fin,
});

export const informeDesdeApi = (api: InformeAmortizacionesApi): InformeAmortizaciones => ({
    ejercicioId: api.ejercicio_id,
    fechaInicio: api.fecha_inicio,
    fechaFin: api.fecha_fin,
    cuentas: api.cuentas.map((c): CuentaInforme => ({
        codigoCuenta: c.codigo_cuenta,
        descripcion: c.descripcion ?? "",
        lineas: c.lineas.map((l): LineaInforme => ({
            id: l.amortizacion_id,
            amortizacionId: l.amortizacion_id,
            elemento: l.elemento,
            ...valoresDesdeApi(l),
        })),
        total: valoresDesdeApi(c.total),
    })),
    total: valoresDesdeApi(api.total),
});

export const parametrosInforme = (filtro: FiltroInforme): string => {
    const parametros = new URLSearchParams({ ejercicio_id: filtro.ejercicioId });
    if (filtro.grupoId) parametros.set("grupo_id", filtro.grupoId);
    if (filtro.codigoCuenta) parametros.set("codigo_cuenta", filtro.codigoCuenta);
    if (filtro.amortizacionId) parametros.set("amortizacion_id", filtro.amortizacionId);
    if (filtro.descripcion) parametros.set("descripcion", filtro.descripcion);
    return parametros.toString();
};

const todasDe = (amortizacionId: string, orden: string): Criteria => ({
    ...criteriaDefecto,
    filtro: [["amortizacion_id", "=", amortizacionId]],
    orden: [orden, "ASC"],
    paginacion: { limite: 1000, pagina: 1 },
});

export const getAmortizaciones: GetAmortizaciones = async (criteria) =>
    RestAPI.getQuery<Amortizacion, AmortizacionApi>(baseUrl, criteria, amortizacionDesdeApi);

export const getAmortizacion: GetAmortizacion = async (id) =>
    RestAPI.getItem<Amortizacion, AmortizacionApi>(urlAmortizacion(id), amortizacionDesdeApi);

export const postAmortizacion = async (nueva: NuevaAmortizacion): Promise<string> => {
    const respuesta = await RestAPI.post(
        baseUrl, nuevaAmortizacionAApi(nueva), tContabilidad("amortizacion.errorAlCrearLaAmortizacion"));
    return String(respuesta.id);
};

export const patchAmortizacion = async (id: string, cambios: CambiosAmortizacion): Promise<void> => {
    await RestAPI.patch(
        urlAmortizacion(id), cambiosAmortizacionAApi(cambios), tContabilidad("amortizacion.errorAlGuardarLaAmortizacion"));
};

export const deleteAmortizacion = async (id: string): Promise<void> => {
    await RestAPI.delete(urlAmortizacion(id), tContabilidad("amortizacion.errorAlBorrarLaAmortizacion"));
};

export const getDotaciones = async (amortizacionId: string): Promise<Dotacion[]> =>
    (await RestAPI.getQuery<Dotacion, DotacionApi>(
        urls.AMORTIZACION_DOTACION, todasDe(amortizacionId, "fecha_fin"), dotacionDesdeApi
    )).datos;

export const postDotacion = async (
    amortizacionId: string, nueva: NuevaDotacion, ejercicioId: string
): Promise<void> => {
    await RestAPI.post(`${urlAmortizacion(amortizacionId)}/dotacion`, {
        ejercicio_id: ejercicioId,
        ...(nueva.importe !== null ? { importe: nueva.importe } : {}),
        ...(nueva.fecha ? { fecha: fechaAApi(nueva.fecha) } : {}),
        no_generar_asiento: nueva.noGenerarAsiento,
    }, tContabilidad("amortizacion.errorAlCrearLaDotacion"));
};

export const deleteDotacion = async (id: string): Promise<void> => {
    await RestAPI.delete(`${urls.AMORTIZACION_DOTACION}/${id}`, tContabilidad("amortizacion.errorAlBorrarLaDotacion"));
};

const resultadoDesdeApi = (api: {
    total_dotaciones: number;
    importe: number;
    amortizaciones: { id: string; elemento: string;
        dotaciones: { fecha_inicio: string; fecha_fin: string; importe: number }[] }[];
}): ResultadoGeneracion => ({
    totalDotaciones: api.total_dotaciones,
    importe: api.importe,
    amortizaciones: api.amortizaciones.map((a) => ({
        id: a.id,
        elemento: a.elemento,
        dotaciones: a.dotaciones.map((d) => ({
            fechaInicio: d.fecha_inicio, fechaFin: d.fecha_fin, importe: d.importe,
        })),
    })),
});

export const postGenerarDotaciones = async (
    ejercicioId: string, fechaLimite: Date
): Promise<ResultadoGeneracion> => {
    const respuesta = await RestAPI.post(urls.AMORTIZACION_GENERAR_DOTACIONES, {
        ejercicio_id: ejercicioId, fecha_limite: fechaAApi(fechaLimite),
    }, tContabilidad("amortizacion.errorAlGenerarLasDotaciones"));
    return resultadoDesdeApi(respuesta as unknown as Parameters<typeof resultadoDesdeApi>[0]);
};

export const postDeshacerDotaciones = async (
    fechaDesde: Date
): Promise<{ totalDotaciones: number; importe: number }> => {
    const respuesta = await RestAPI.post(urls.AMORTIZACION_DESHACER_DOTACIONES, {
        fecha_desde: fechaAApi(fechaDesde),
    }, tContabilidad("amortizacion.errorAlDeshacerLasDotaciones")) as unknown as { total_dotaciones: number; importe: number };
    return { totalDotaciones: respuesta.total_dotaciones, importe: respuesta.importe };
};

export const patchCerrarAmortizacion = async (
    id: string, fechaCierre: Date, ejercicioId: string
): Promise<void> => {
    await RestAPI.patch(`${urlAmortizacion(id)}/cerrar`, {
        fecha_cierre: fechaAApi(fechaCierre), ejercicio_id: ejercicioId,
    }, tContabilidad("amortizacion.errorAlCerrarLaAmortizacion"));
};

export const patchReabrirAmortizacion = async (id: string): Promise<void> => {
    await RestAPI.patch(`${urlAmortizacion(id)}/reabrir`, {}, tContabilidad("amortizacion.errorAlReabrirLaAmortizacion"));
};

export const getRegularizaciones = async (amortizacionId: string): Promise<RegularizacionValor[]> =>
    (await RestAPI.getQuery<RegularizacionValor, RegularizacionValorApi>(
        urls.AMORTIZACION_REGULARIZACION_VALOR, todasDe(amortizacionId, "fecha"),
        regularizacionDesdeApi
    )).datos;

export const postRegularizacion = async (
    amortizacionId: string, nueva: NuevaRegularizacionValor
): Promise<void> => {
    await RestAPI.post(`${urlAmortizacion(amortizacionId)}/regularizacion_valor`, {
        fecha: fechaAApi(nueva.fecha),
        descripcion: nueva.descripcion.trim() || null,
        importe: nueva.importe,
    }, tContabilidad("amortizacion.errorAlCrearLaRegularizacionDe"));
};

export const deleteRegularizacion = async (id: string): Promise<void> => {
    await RestAPI.delete(
        `${urls.AMORTIZACION_REGULARIZACION_VALOR}/${id}`,
        tContabilidad("amortizacion.errorAlBorrarLaRegularizacionDe"));
};

export const getPartidasCompra = async (
    amortizacionId: string, candidatas: boolean
): Promise<PartidaCompra[]> =>
    RestAPI.getLista<PartidaCompra, PartidaCompraApi>(
        `${urlAmortizacion(amortizacionId)}/partida_compra?candidatas=${candidatas}`,
        partidaCompraDesdeApi
    );

export const postAsociarPartida = async (amortizacionId: string, partidaId: string): Promise<void> => {
    await RestAPI.post(`${urlAmortizacion(amortizacionId)}/partida_compra`,
        { partida_id: Number(partidaId) }, tContabilidad("amortizacion.errorAlAsociarLaFactura"));
};

export const deleteQuitarPartida = async (amortizacionId: string, partidaId: string): Promise<void> => {
    await RestAPI.delete(`${urlAmortizacion(amortizacionId)}/partida_compra/${partidaId}`,
        tContabilidad("amortizacion.errorAlQuitarLaFactura"));
};

export const getInformeAmortizaciones = async (filtro: FiltroInforme): Promise<InformeAmortizaciones> => {
    const respuesta = await RestAPI.get<{ datos: InformeAmortizacionesApi }>(
        `${urls.AMORTIZACION_INFORME}?${parametrosInforme(filtro)}`,
        tContabilidad("amortizacion.errorAlCalcularElInformeDe"));
    return informeDesdeApi(respuesta.datos);
};

export const getReportAmortizaciones = async (filtro: FiltroInforme): Promise<Blob> =>
    RestAPI.blob(
        `${urls.AMORTIZACION_INFORME_REPORT}?${parametrosInforme(filtro)}`,
        tContabilidad("amortizacion.errorAlDescargarElPdfDe"));
