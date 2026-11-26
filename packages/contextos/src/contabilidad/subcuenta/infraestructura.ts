import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "#/contabilidad/comun/urls.ts";
import {
    CambiosSubcuenta,
    GetSubcuenta,
    GetSubcuentas,
    NuevaSubcuenta,
    DeleteSubcuenta,
    PatchRecalcularSaldosSubcuentas,
    PatchSubcuenta,
    PostSubcuenta,
    ResultadoRecalculoSaldos,
    Subcuenta,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

const baseUrl = new ApiUrls().SUBCUENTA;

export interface SubcuentaApi {
    id: number;
    codigo: string;
    nombre: string;
    ejercicio_id: string;
    cuenta_id: number;
    codigo_cuenta: string;
    impuesto_id?: string | null;
    iva?: number;
    recargo?: number;
    cuenta_especial_id?: string | null;
    es_iva?: boolean;
}

export const subcuentaDesdeApi = (api: SubcuentaApi): Subcuenta => ({
    id: String(api.id),
    codigo: api.codigo,
    nombre: api.nombre,
    ejercicioId: api.ejercicio_id,
    cuentaId: api.cuenta_id,
    codigoCuenta: api.codigo_cuenta,
    impuestoId: api.impuesto_id ?? "",
    iva: api.iva ?? 0,
    recargo: api.recargo ?? 0,
    cuentaEspecialId: api.cuenta_especial_id ?? "",
    esIva: api.es_iva ?? false,
});

export const getSubcuentas: GetSubcuentas = async (criteria) =>
    RestAPI.getQuery<Subcuenta, SubcuentaApi>(baseUrl, criteria, subcuentaDesdeApi);

export const getSubcuenta: GetSubcuenta = async (id) =>
    RestAPI.getItem<Subcuenta, SubcuentaApi>(`${baseUrl}/${id}`, subcuentaDesdeApi);

export const nuevaSubcuentaAApi = (nuevo: NuevaSubcuenta) => ({
    codigo: nuevo.codigo,
    nombre: nuevo.nombre,
    codigo_cuenta: nuevo.codigoCuenta,
    ejercicio_id: nuevo.ejercicioId,
    ...(nuevo.impuestoId ? { impuesto_id: nuevo.impuestoId } : {}),
});

export const postSubcuenta: PostSubcuenta = async (nuevo) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        nuevaSubcuentaAApi(nuevo),
        tContabilidad("subcuenta.errorAlCrearSubcuenta"),
    );
    return String(respuesta.id);
};

export const cambiosSubcuentaAApi = (cambios: CambiosSubcuenta) => {
    const api: Record<string, string | null> = {};
    if (cambios.nombre !== undefined) api.nombre = cambios.nombre;
    if (cambios.impuestoId !== undefined) {
        api.impuesto_id = cambios.impuestoId || null;
    }
    return api;
};

export const patchSubcuenta: PatchSubcuenta = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        cambiosSubcuentaAApi(cambios),
        tContabilidad("subcuenta.errorAlGuardarSubcuenta"),
    );
};

export const deleteSubcuenta: DeleteSubcuenta = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tContabilidad("subcuenta.errorAlBorrarSubcuenta"));
};

export interface ResultadoRecalculoSaldosApi {
    ejercicios: string[];
    revisadas: number;
    corregidas: {
        id: number;
        codigo: string;
        ejercicio_id: string;
        debe_antes: number;
        haber_antes: number;
        debe: number;
        haber: number;
        saldo: number;
    }[];
}

export const resultadoRecalculoSaldosDesdeApi = (
    api: ResultadoRecalculoSaldosApi
): ResultadoRecalculoSaldos => ({
    ejercicios: api.ejercicios,
    revisadas: api.revisadas,
    corregidas: api.corregidas.map((c) => ({
        id: c.id,
        codigo: c.codigo,
        ejercicioId: c.ejercicio_id,
        debeAntes: c.debe_antes,
        haberAntes: c.haber_antes,
        debe: c.debe,
        haber: c.haber,
        saldo: c.saldo,
    })),
});

/**
 * `PATCH /contabilidad/subcuenta/recalcular_saldos` (Eneboo `mt_procesos` 1/44).
 * Sin ejercicio, todos los ejercicios abiertos.
 */
export const patchRecalcularSaldosSubcuentas: PatchRecalcularSaldosSubcuentas = async (
    ejercicioId
) => {
    const respuesta = (await RestAPI.patch(
        `${baseUrl}/recalcular_saldos`,
        ejercicioId ? { ejercicio_id: ejercicioId } : {},
        tContabilidad("subcuenta.errorAlRecalcularLosSaldosDe")
    )) as unknown as ResultadoRecalculoSaldosApi | { datos: ResultadoRecalculoSaldosApi };
    const datos = "datos" in respuesta ? respuesta.datos : respuesta;
    return resultadoRecalculoSaldosDesdeApi(datos);
};
