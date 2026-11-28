import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "#/contabilidad/comun/urls.ts";
import {
    Asiento,
    GetAsiento,
    GetAsientos,
    GetPartidasAsiento,
    ItemAsiento,
    PartidaAsiento,
    PartidaManualInput,
    PatchAsientoManual,
    PatchRenumerarAsientos,
    PostAsientoManual,
    DeleteAsientoManual,
    PayloadRenumerarAsientos,
    ResultadoRenumeracionAsientos,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

const urls = new ApiUrls();
const baseUrl = urls.ASIENTO;
const partidaUrl = urls.PARTIDA;
const renumerarUrl = urls.ASIENTO_RENUMERAR;

interface ItemAsientoApi {
    id: number;
    numero: number;
    ejercicio_id: string;
    fecha: string;
    concepto: string;
    importe: number;
    manual: boolean;
    tipo_documento: string | null;
    documento: string | null;
}

interface PartidaAsientoApi {
    id: number;
    asiento_id: number;
    subcuenta_id: number;
    codigo_subcuenta: string | null;
    debe: number;
    haber: number;
    concepto: string;
    es_iva?: boolean;
    base_imponible?: number | null;
    iva?: number | null;
    recargo?: number | null;
    grupo_iva_producto_id?: string | null;
    grupo_iva_negocio_id?: string | null;
    contrapartida_id?: number | null;
    casilla303?: string | null;
    divisa_id?: string | null;
    tasa_conversion?: number;
    debe_me?: number;
    haber_me?: number;
}

interface AsientoDetalleApi extends ItemAsientoApi {
    partidas: PartidaAsientoApi[];
}

const fechaDesdeApi = (fecha: string): Date => new Date(`${fecha}T12:00:00`);
const fechaAApi = (fecha: Date): string => fecha.toISOString().slice(0, 10);

export const partidaAsientoDesdeApi = (api: PartidaAsientoApi): PartidaAsiento => ({
    id: String(api.id),
    asientoId: String(api.asiento_id),
    subcuentaId: api.subcuenta_id,
    codigoSubcuenta: api.codigo_subcuenta ?? "",
    debe: api.debe,
    haber: api.haber,
    concepto: api.concepto ?? "",
    esIva: api.es_iva,
    baseImponible: api.base_imponible,
    iva: api.iva,
    recargo: api.recargo,
    grupoIvaProductoId: api.grupo_iva_producto_id,
    grupoIvaNegocioId: api.grupo_iva_negocio_id,
    contrapartidaId: api.contrapartida_id,
    casilla303: api.casilla303,
    divisaId: api.divisa_id ?? null,
    tasaConversion: api.tasa_conversion ?? 1,
    debeMe: api.debe_me ?? 0,
    haberMe: api.haber_me ?? 0,
});

export const itemAsientoDesdeApi = (api: ItemAsientoApi): ItemAsiento => ({
    id: String(api.id),
    numero: api.numero,
    ejercicioId: api.ejercicio_id,
    fecha: fechaDesdeApi(api.fecha),
    concepto: api.concepto,
    importe: api.importe,
    manual: api.manual,
    tipoDocumento: api.tipo_documento ?? "",
    documento: api.documento ?? "",
});

export const asientoDesdeApi = (api: AsientoDetalleApi): Asiento => ({
    ...itemAsientoDesdeApi(api),
    partidas: api.partidas.map(partidaAsientoDesdeApi),
});

// `es_iva` no viaja: el servidor lo deduce de la cuenta especial de la
// subcuenta (IVASOP / IVAREP), como el ERP en co_partidas.qs.
const partidaManualAApi = (p: PartidaManualInput) => ({
    ...(p.id ? { id: Number(p.id) } : {}),
    subcuenta_id: p.subcuentaId,
    debe: p.debe,
    haber: p.haber,
    ...(p.concepto ? { concepto: p.concepto } : {}),
    ...(p.baseImponible !== undefined ? { base_imponible: p.baseImponible } : {}),
    ...(p.ivaPct !== undefined ? { iva: p.ivaPct } : {}),
    ...(p.recargo !== undefined ? { recargo: p.recargo } : {}),
    ...(p.grupoIvaProductoId ? { grupo_iva_producto_id: p.grupoIvaProductoId } : {}),
    ...(p.grupoIvaNegocioId ? { grupo_iva_negocio_id: p.grupoIvaNegocioId } : {}),
    ...(p.contrapartidaId ? { contrapartida_id: p.contrapartidaId } : {}),
    ...(p.casilla303 ? { casilla303: p.casilla303 } : {}),
    ...(p.divisaId
        ? {
              divisa_id: p.divisaId,
              tasa_conversion: p.tasaConversion ?? 1,
              debe_me: p.debeMe ?? 0,
              haber_me: p.haberMe ?? 0,
          }
        : {}),
});

export const getAsiento: GetAsiento = async (id) =>
    RestAPI.getItem<Asiento, AsientoDetalleApi>(`${baseUrl}/${id}`, asientoDesdeApi);

export const getAsientos: GetAsientos = async (criteria) =>
    RestAPI.getQuery<ItemAsiento, ItemAsientoApi>(baseUrl, criteria, itemAsientoDesdeApi);

export const getPartidasAsiento: GetPartidasAsiento = async (criteria) =>
    RestAPI.getQuery<PartidaAsiento, PartidaAsientoApi>(partidaUrl, criteria, partidaAsientoDesdeApi);

export const postAsientoManual: PostAsientoManual = async (nuevo) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        {
            ejercicio_id: nuevo.ejercicioId,
            fecha: fechaAApi(nuevo.fecha),
            concepto: nuevo.concepto,
            tipo_documento: nuevo.tipoDocumento || null,
            documento: nuevo.documento || null,
            partidas: nuevo.partidas.map(partidaManualAApi),
        },
        tContabilidad("asiento.errorAlCrearAsientoManual")
    );
    return {
        id: String((respuesta as unknown as { id: number }).id ?? respuesta.id),
        numero: (respuesta as { numero?: number }).numero ?? 0,
    };
};

export const patchAsientoManual: PatchAsientoManual = async (id, cambios) => {
    const body: Record<string, unknown> = {};
    if (cambios.fecha) body.fecha = fechaAApi(cambios.fecha);
    if (cambios.concepto !== undefined) body.concepto = cambios.concepto;
    // "" significa «sin documento»: el servidor lo normaliza a null.
    if (cambios.tipoDocumento !== undefined) body.tipo_documento = cambios.tipoDocumento || null;
    if (cambios.documento !== undefined) body.documento = cambios.documento || null;
    if (cambios.partidas) body.partidas = cambios.partidas.map(partidaManualAApi);

    const respuesta = (await RestAPI.patch(
        `${baseUrl}/${id}`,
        body,
        tContabilidad("asiento.errorAlModificarAsientoManual")
    )) as { id?: number; numero?: number } | void;

    return {
        id: String(respuesta?.id ?? id),
        numero: respuesta?.numero ?? 0,
    };
};

export const deleteAsientoManual: DeleteAsientoManual = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tContabilidad("asiento.errorAlBorrarAsientoManual"));
};

interface ResultadoRenumeracionAsientosApi {
    ejercicio_id: string;
    total_asientos: number;
    asientos_renumerados: number;
    ultimo_numero: number;
    siguiente_secuencia: number | null;
    modo: ResultadoRenumeracionAsientos["modo"];
}

export const resultadoRenumeracionAsientosDesdeApi = (
    api: ResultadoRenumeracionAsientosApi
): ResultadoRenumeracionAsientos => ({
    ejercicioId: api.ejercicio_id,
    totalAsientos: api.total_asientos,
    asientosRenumerados: api.asientos_renumerados,
    ultimoNumero: api.ultimo_numero,
    siguienteSecuencia: api.siguiente_secuencia,
    modo: api.modo,
});

const payloadRenumerarAApi = (payload: PayloadRenumerarAsientos): Record<string, unknown> => {
    const body: Record<string, unknown> = { ejercicio_id: payload.ejercicioId };
    if (payload.fechaDesde) body.fecha_desde = payload.fechaDesde;
    if (payload.fechaHasta) body.fecha_hasta = payload.fechaHasta;
    if (payload.numeroDesde !== undefined) body.numero_desde = payload.numeroDesde;
    if (payload.numeroHasta !== undefined) body.numero_hasta = payload.numeroHasta;
    return body;
};

export const patchRenumerarAsientos: PatchRenumerarAsientos = async (payload) => {
    const respuesta = (await RestAPI.patch(
        renumerarUrl,
        payloadRenumerarAApi(payload),
        tContabilidad("asiento.errorAlRenumerarAsientos")
    )) as unknown as ResultadoRenumeracionAsientosApi | { datos: ResultadoRenumeracionAsientosApi };

    const datos =
        respuesta && typeof respuesta === "object" && "datos" in respuesta
            ? respuesta.datos
            : respuesta;
    return resultadoRenumeracionAsientosDesdeApi(datos as ResultadoRenumeracionAsientosApi);
};
