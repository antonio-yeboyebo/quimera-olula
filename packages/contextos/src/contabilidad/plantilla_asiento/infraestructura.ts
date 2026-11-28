import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "#/contabilidad/comun/urls.ts";
import {
    CalcularAsientoDesdePlantilla,
    CambiosPartidaPlantilla,
    CamposPartidaPlantilla,
    DeletePartidaPlantilla,
    DeletePlantillaAsiento,
    GetPlantillaAsiento,
    GetPlantillasAsiento,
    ItemPlantillaAsiento,
    PartidaCalculada,
    PartidaPlantilla,
    PatchPartidaPlantilla,
    PatchPlantillaAsiento,
    PeticionAsientoDesdePlantilla,
    PlantillaAsiento,
    PostAsientoDesdePlantilla,
    PostPartidaPlantilla,
    PostPlantillaAsiento,
    ResultadoCalculoPlantilla,
    TipoDocumentoOrigen,
    ValoresPartidaPlantilla,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

const urls = new ApiUrls();
const baseUrl = urls.PLANTILLA_ASIENTO;

const url = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;
const urlPartida = (id: string, partidaId: string) =>
    `${url(id)}/partida/${encodeURIComponent(partidaId)}`;

export interface ItemPlantillaAsientoApi {
    id: string;
    descripcion: string;
    concatenar: string | null;
}

export interface PartidaPlantillaApi {
    id: number;
    numero_orden: number;
    tipo_subcuenta: string;
    codigo_subcuenta: string | null;
    variable_subcuenta: string | null;
    debe_haber: string;
    saltar_si_cero: boolean;
    tipo_importe: string;
    importe: string | null;
    variable_importe: string | null;
    tipo_concepto: string;
    concepto: string | null;
    variable_concepto: string | null;
    tipo_documento: string;
    documento: string | null;
    tipo_documento_origen: string | null;
    tipo_factura: string;
    serie_id: string | null;
    tipo_base_imponible: string;
    base_imponible: string | null;
    variable_base_imponible: string | null;
    tipo_contrapartida: string;
    codigo_contrapartida: string | null;
    variable_contrapartida: string | null;
}

export interface PlantillaAsientoApi extends ItemPlantillaAsientoApi {
    partidas: PartidaPlantillaApi[];
}

type PartidaPlantillaApiSinId = Omit<PartidaPlantillaApi, "id">;

const texto = (v: string | null | undefined): string => v ?? "";
const nulo = (v: string): string | null => (v.trim() ? v.trim() : null);

export const itemPlantillaAsientoDesdeApi = (api: ItemPlantillaAsientoApi): ItemPlantillaAsiento => ({
    id: api.id,
    descripcion: texto(api.descripcion),
    concatenar: texto(api.concatenar),
});

export const partidaPlantillaDesdeApi = (api: PartidaPlantillaApi): PartidaPlantilla => ({
    id: String(api.id),
    numeroOrden: api.numero_orden,
    tipoSubcuenta: api.tipo_subcuenta as PartidaPlantilla["tipoSubcuenta"],
    codigoSubcuenta: texto(api.codigo_subcuenta),
    variableSubcuenta: texto(api.variable_subcuenta),
    debeHaber: api.debe_haber as PartidaPlantilla["debeHaber"],
    saltarSiCero: !!api.saltar_si_cero,
    tipoImporte: api.tipo_importe as PartidaPlantilla["tipoImporte"],
    importe: texto(api.importe),
    variableImporte: texto(api.variable_importe),
    tipoConcepto: api.tipo_concepto as PartidaPlantilla["tipoConcepto"],
    concepto: texto(api.concepto),
    variableConcepto: texto(api.variable_concepto),
    tipoDocumento: api.tipo_documento as PartidaPlantilla["tipoDocumento"],
    documento: texto(api.documento),
    tipoDocumentoOrigen: texto(api.tipo_documento_origen) as TipoDocumentoOrigen,
    tipoFactura: api.tipo_factura as PartidaPlantilla["tipoFactura"],
    serieId: texto(api.serie_id),
    tipoBaseImponible: api.tipo_base_imponible as PartidaPlantilla["tipoBaseImponible"],
    baseImponible: texto(api.base_imponible),
    variableBaseImponible: texto(api.variable_base_imponible),
    tipoContrapartida: api.tipo_contrapartida as PartidaPlantilla["tipoContrapartida"],
    codigoContrapartida: texto(api.codigo_contrapartida),
    variableContrapartida: texto(api.variable_contrapartida),
});

export const plantillaAsientoDesdeApi = (api: PlantillaAsientoApi): PlantillaAsiento => ({
    ...itemPlantillaAsientoDesdeApi(api),
    partidas: api.partidas.map(partidaPlantillaDesdeApi),
});

const CAMPOS_API: Record<keyof CamposPartidaPlantilla, keyof PartidaPlantillaApiSinId> = {
    numeroOrden: "numero_orden",
    tipoSubcuenta: "tipo_subcuenta",
    codigoSubcuenta: "codigo_subcuenta",
    variableSubcuenta: "variable_subcuenta",
    debeHaber: "debe_haber",
    saltarSiCero: "saltar_si_cero",
    tipoImporte: "tipo_importe",
    importe: "importe",
    variableImporte: "variable_importe",
    tipoConcepto: "tipo_concepto",
    concepto: "concepto",
    variableConcepto: "variable_concepto",
    tipoDocumento: "tipo_documento",
    documento: "documento",
    tipoDocumentoOrigen: "tipo_documento_origen",
    tipoFactura: "tipo_factura",
    serieId: "serie_id",
    tipoBaseImponible: "tipo_base_imponible",
    baseImponible: "base_imponible",
    variableBaseImponible: "variable_base_imponible",
    tipoContrapartida: "tipo_contrapartida",
    codigoContrapartida: "codigo_contrapartida",
    variableContrapartida: "variable_contrapartida",
};

/** Solo los campos presentes; los textos vacíos viajan como null. */
export const partidaPlantillaAApi = (
    partida: CambiosPartidaPlantilla
): Partial<PartidaPlantillaApiSinId> => {
    const api: Record<string, unknown> = {};
    for (const [campo, campoApi] of Object.entries(CAMPOS_API)) {
        const valor = partida[campo as keyof CamposPartidaPlantilla];
        if (valor === undefined) continue;
        if (typeof valor === "string") {
            api[campoApi] = nulo(valor);
        } else {
            api[campoApi] = valor;
        }
    }
    // Sin número de orden el servidor pone el siguiente.
    if (!api.numero_orden) delete api.numero_orden;
    return api as Partial<PartidaPlantillaApiSinId>;
};

export const getPlantillasAsiento: GetPlantillasAsiento = async (criteria) =>
    RestAPI.getQuery<ItemPlantillaAsiento, ItemPlantillaAsientoApi>(
        baseUrl,
        criteria,
        itemPlantillaAsientoDesdeApi
    );

export const getPlantillaAsiento: GetPlantillaAsiento = async (id) =>
    RestAPI.getItem<PlantillaAsiento, PlantillaAsientoApi>(
        url(id),
        plantillaAsientoDesdeApi
    );

export const postPlantillaAsiento: PostPlantillaAsiento = async (nueva) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        {
            id: nueva.codigo.trim(),
            descripcion: nueva.descripcion,
            concatenar: nulo(nueva.concatenar),
        },
        tContabilidad("plantilla_asiento.errorAlCrearLaPlantillaDe")
    );
    return String(respuesta.id);
};

export const patchPlantillaAsiento: PatchPlantillaAsiento = async (id, cambios) => {
    const api: Record<string, string | null> = {};
    if (cambios.descripcion !== undefined) api.descripcion = cambios.descripcion;
    if (cambios.concatenar !== undefined) api.concatenar = nulo(cambios.concatenar);
    await RestAPI.patch(url(id), api, tContabilidad("plantilla_asiento.errorAlGuardarLaPlantillaDe"));
};

export const deletePlantillaAsiento: DeletePlantillaAsiento = async (id) => {
    await RestAPI.delete(url(id), tContabilidad("plantilla_asiento.errorAlBorrarLaPlantillaDe"));
};

export const postPartidaPlantilla: PostPartidaPlantilla = async (id, nueva) => {
    const respuesta = await RestAPI.post(
        `${url(id)}/partida`,
        partidaPlantillaAApi(nueva),
        tContabilidad("plantilla_asiento.errorAlCrearLaPartida")
    );
    return String(respuesta.id);
};

export const patchPartidaPlantilla: PatchPartidaPlantilla = async (id, partidaId, cambios) => {
    await RestAPI.patch(
        urlPartida(id, partidaId),
        partidaPlantillaAApi(cambios),
        tContabilidad("plantilla_asiento.errorAlGuardarLaPartida")
    );
};

export const deletePartidaPlantilla: DeletePartidaPlantilla = async (id, partidaId) => {
    await RestAPI.delete(urlPartida(id, partidaId), tContabilidad("plantilla_asiento.errorAlBorrarLaPartida"));
};

// --- Asiento desde plantilla ----------------------------------------------

interface ValoresPartidaPlantillaApi {
    codigo_subcuenta?: string;
    importe?: number;
    concepto?: string;
    documento?: string;
    codigo_contrapartida?: string;
    base_imponible?: number;
    numero_factura?: string;
}

const valoresAApi = (v: ValoresPartidaPlantilla): ValoresPartidaPlantillaApi => {
    const api: ValoresPartidaPlantillaApi = {};
    if (v.codigoSubcuenta !== undefined) api.codigo_subcuenta = v.codigoSubcuenta;
    if (v.importe !== undefined) api.importe = v.importe;
    if (v.concepto !== undefined) api.concepto = v.concepto;
    if (v.documento !== undefined) api.documento = v.documento;
    if (v.codigoContrapartida !== undefined) api.codigo_contrapartida = v.codigoContrapartida;
    if (v.baseImponible !== undefined) api.base_imponible = v.baseImponible;
    if (v.numeroFactura !== undefined) api.numero_factura = v.numeroFactura;
    return api;
};

export const peticionAsientoDesdePlantillaAApi = (p: PeticionAsientoDesdePlantilla) => ({
    plantilla_id: p.plantillaId,
    ejercicio_id: p.ejercicioId,
    ...(p.fecha ? { fecha: p.fecha.toISOString().slice(0, 10) } : {}),
    ...(p.concepto?.trim() ? { concepto: p.concepto.trim() } : {}),
    valores: Object.fromEntries(
        Object.entries(p.valores).map(([id, v]) => [id, valoresAApi(v)])
    ),
    variables: p.variables,
});

interface PartidaCalculadaApi {
    partida_plantilla_id: string;
    numero_orden: number;
    codigo_subcuenta: string;
    debe: number;
    haber: number;
    concepto: string;
    documento: string;
    tipo_documento: string | null;
    codigo_contrapartida: string | null;
    es_iva: boolean;
    base_imponible: number | null;
    serie_id: string | null;
    numero_factura: string | null;
    omitida: boolean;
}

export interface ResultadoCalculoPlantillaApi {
    plantilla_id: string;
    partidas: PartidaCalculadaApi[];
    descuadre: number;
    variables: Record<string, string>;
    siguiente_plantilla_id: string | null;
    avisos: string[];
}

const partidaCalculadaDesdeApi = (api: PartidaCalculadaApi): PartidaCalculada => ({
    partidaPlantillaId: String(api.partida_plantilla_id),
    numeroOrden: api.numero_orden,
    codigoSubcuenta: api.codigo_subcuenta,
    debe: api.debe,
    haber: api.haber,
    concepto: texto(api.concepto),
    documento: texto(api.documento),
    tipoDocumento: texto(api.tipo_documento),
    codigoContrapartida: texto(api.codigo_contrapartida),
    esIva: api.es_iva,
    baseImponible: api.base_imponible,
    serieId: texto(api.serie_id),
    numeroFactura: texto(api.numero_factura),
    omitida: api.omitida,
});

export const resultadoCalculoDesdeApi = (api: ResultadoCalculoPlantillaApi): ResultadoCalculoPlantilla => ({
    plantillaId: api.plantilla_id,
    partidas: api.partidas.map(partidaCalculadaDesdeApi),
    descuadre: api.descuadre,
    variables: api.variables ?? {},
    siguientePlantillaId: texto(api.siguiente_plantilla_id),
    avisos: api.avisos ?? [],
});

export const calcularAsientoDesdePlantilla: CalcularAsientoDesdePlantilla = async (peticion) => {
    const respuesta = await RestAPI.query<
        ReturnType<typeof peticionAsientoDesdePlantillaAApi>,
        ResultadoCalculoPlantillaApi
    >(
        urls.ASIENTO_DESDE_PLANTILLA_CALCULAR,
        peticionAsientoDesdePlantillaAApi(peticion),
        tContabilidad("plantilla_asiento.errorAlCalcularElAsiento")
    );
    return resultadoCalculoDesdeApi(respuesta);
};

export const postAsientoDesdePlantilla: PostAsientoDesdePlantilla = async (peticion) => {
    const respuesta = await RestAPI.query<
        ReturnType<typeof peticionAsientoDesdePlantillaAApi>,
        { id: number; numero: number }
    >(
        urls.ASIENTO_DESDE_PLANTILLA,
        peticionAsientoDesdePlantillaAApi(peticion),
        tContabilidad("plantilla_asiento.errorAlCrearElAsiento")
    );
    return { id: String(respuesta.id), numero: respuesta.numero };
};
