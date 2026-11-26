import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "#/contabilidad/comun/urls.ts";
import {
    DeleteRegularizacionIva,
    GetRegularizacionesIva,
    GetRegularizacionIva,
    NuevaRegularizacionIva,
    PostRegularizacionIva,
    RegularizacionIva,
    SubcuentasRegularizacionIva,
} from "./diseño.ts";
import { periodoNuevaRegularizacion } from "./dominio.ts";
import { tContabilidad } from "../i18n/index.ts";

const baseUrl = new ApiUrls().REGULARIZACION_IVA;

export interface RegularizacionIvaApi {
    id: number;
    ejercicio_id: string;
    periodo: string;
    fecha_inicio: string;
    fecha_fin: string;
    fecha_asiento: string;
    asiento_id: number;
    numero_asiento: number | null;
    importe: number | null;
    codigo_subcuenta_deudora: string | null;
    codigo_subcuenta_acreedora: string | null;
}

const fechaDesdeApi = (fecha: string): Date => new Date(`${fecha}T12:00:00`);

const dosCifras = (n: number): string => String(n).padStart(2, "0");

/** Fecha local a `AAAA-MM-DD` sin pasar por UTC (toISOString cambiaría de
 * día con las fechas a medianoche). */
export const fechaAApi = (fecha: Date): string =>
    `${fecha.getFullYear()}-${dosCifras(fecha.getMonth() + 1)}-${dosCifras(fecha.getDate())}`;

export const regularizacionIvaDesdeApi = (
    api: RegularizacionIvaApi
): RegularizacionIva => ({
    id: String(api.id),
    ejercicioId: api.ejercicio_id,
    periodo: api.periodo,
    fechaInicio: fechaDesdeApi(api.fecha_inicio),
    fechaFin: fechaDesdeApi(api.fecha_fin),
    fechaAsiento: fechaDesdeApi(api.fecha_asiento),
    asientoId: String(api.asiento_id),
    numeroAsiento: api.numero_asiento,
    importe: api.importe,
    codigoSubcuentaDeudora: api.codigo_subcuenta_deudora ?? "",
    codigoSubcuentaAcreedora: api.codigo_subcuenta_acreedora ?? "",
});

export const nuevaRegularizacionIvaAApi = (nueva: NuevaRegularizacionIva) => {
    const periodo = periodoNuevaRegularizacion(nueva);
    return {
        ejercicio_id: nueva.ejercicioId,
        fecha_inicio: fechaAApi(periodo.fechaInicio),
        fecha_fin: fechaAApi(periodo.fechaFin),
        fecha_asiento: fechaAApi(periodo.fechaAsiento),
        ...(nueva.codigoSubcuentaDeudora
            ? { codigo_subcuenta_deudora: nueva.codigoSubcuentaDeudora }
            : {}),
        ...(nueva.codigoSubcuentaAcreedora
            ? { codigo_subcuenta_acreedora: nueva.codigoSubcuentaAcreedora }
            : {}),
    };
};

export const getRegularizacionesIva: GetRegularizacionesIva = async (criteria) =>
    RestAPI.getQuery<RegularizacionIva, RegularizacionIvaApi>(
        baseUrl,
        criteria,
        regularizacionIvaDesdeApi
    );

export const getRegularizacionIva: GetRegularizacionIva = async (id) =>
    RestAPI.getItem<RegularizacionIva, RegularizacionIvaApi>(
        `${baseUrl}/${id}`,
        regularizacionIvaDesdeApi
    );

export const postRegularizacionIva: PostRegularizacionIva = async (nueva) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        nuevaRegularizacionIvaAApi(nueva),
        tContabilidad("regularizacion_iva.errorAlRegularizarElIva"),
    );
    return String(respuesta.id);
};

export interface SubcuentasRegularizacionIvaApi {
    codigo_subcuenta_deudora: string | null;
    codigo_subcuenta_acreedora: string | null;
}

/** Subcuentas H.P. deudora (IVADEU) y acreedora (IVAACR) que propone el
 * servidor para el ejercicio. */
export const getSubcuentasRegularizacionIva = async (
    ejercicioId: string
): Promise<SubcuentasRegularizacionIva> => {
    const { datos } = await RestAPI.get<{ datos: SubcuentasRegularizacionIvaApi }>(
        `${baseUrl}/subcuentas_defecto/${encodeURIComponent(ejercicioId)}`
    );
    return {
        codigoSubcuentaDeudora: datos.codigo_subcuenta_deudora ?? "",
        codigoSubcuentaAcreedora: datos.codigo_subcuenta_acreedora ?? "",
    };
};

export const deleteRegularizacionIva: DeleteRegularizacionIva = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        tContabilidad("regularizacion_iva.errorAlBorrarLaRegularizacionDe")
    );
};
