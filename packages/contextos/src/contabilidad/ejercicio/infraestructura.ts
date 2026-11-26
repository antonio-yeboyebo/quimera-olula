import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { getAsiento } from "#/contabilidad/asiento/infraestructura.ts";
import ApiUrls from "#/contabilidad/comun/urls.ts";
import {
    Ejercicio,
    EstadoEjercicio,
    FilaAsientoEjercicio,
    GenerarPgc,
    GetEjercicio,
    GetEjercicios,
    NuevoEjercicio,
    OpcionesCierre,
    ResultadoCierre,
    SerieEjercicio,
} from "./diseño.ts";
import { asientosDelEjercicio, seriesDesdeTexto } from "./dominio.ts";
import { tContabilidad } from "../i18n/index.ts";

const urls = new ApiUrls();
const baseUrl = urls.EJERCICIO;

export interface EjercicioApi {
    id: string;
    nombre: string;
    empresa_id: number | null;
    divisa_id?: string | null;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    digitos_subcuenta: number;
    plan_contable: string | null;
    tiene_pgc: boolean;
    asiento_apertura_id: number | null;
    asiento_pyg_id: number | null;
    asiento_cierre_id: number | null;
}

const fechaDesdeApi = (fecha: string): Date => new Date(`${fecha}T12:00:00`);
const dos = (n: number): string => String(n).padStart(2, "0");

export const fechaAApi = (fecha: Date): string =>
    `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;

export const ejercicioDesdeApi = (api: EjercicioApi): Ejercicio => ({
    id: api.id,
    nombre: api.nombre ?? "",
    empresaId: api.empresa_id,
    divisaId: api.divisa_id ?? undefined,
    fechaInicio: fechaDesdeApi(api.fecha_inicio),
    fechaFin: fechaDesdeApi(api.fecha_fin),
    estado: (api.estado === "CERRADO" ? "CERRADO" : "ABIERTO") as EstadoEjercicio,
    digitosSubcuenta: api.digitos_subcuenta,
    planContable: api.plan_contable ?? "",
    tienePgc: api.tiene_pgc,
    asientoAperturaId: api.asiento_apertura_id,
    asientoPygId: api.asiento_pyg_id,
    asientoCierreId: api.asiento_cierre_id,
});

export const getEjercicios: GetEjercicios = async (criteria) =>
    RestAPI.getQuery<Ejercicio, EjercicioApi>(baseUrl, criteria, ejercicioDesdeApi);

export const getEjercicio: GetEjercicio = async (id) =>
    RestAPI.getItem<Ejercicio, EjercicioApi>(`${baseUrl}/${id}`, ejercicioDesdeApi);

export const nuevoEjercicioAApi = (nuevo: NuevoEjercicio, empresaId: number | null) => ({
    id: nuevo.id,
    empresa_id: String(empresaId ?? 1),
    nombre: nuevo.nombre,
    fecha_inicio: fechaAApi(nuevo.fechaInicio),
    fecha_fin: fechaAApi(nuevo.fechaFin),
    digitos_subcuenta: Number(nuevo.digitosSubcuenta),
    serie_ids: seriesDesdeTexto(nuevo.series),
});

export const generarPgcAApi = (datos: GenerarPgc): Record<string, string | number> =>
    datos.ejercicioOrigenId
        ? { ejercicio_origen_id: datos.ejercicioOrigenId }
        : { digitos_subcuenta: Number(datos.digitosSubcuenta) };

/** Crea el ejercicio y, como el botón «PGC» de Eneboo, su plan contable. */
export const postEjercicio = async (
    nuevo: NuevoEjercicio,
    empresaId: number | null
): Promise<string> => {
    await RestAPI.post(
        urls.EJERCICIO_ALTA,
        nuevoEjercicioAApi(nuevo, empresaId),
        tContabilidad("ejercicio.errorAlCrearElEjercicio"),
    );
    await patchGenerarPgc(nuevo.id, {
        ejercicioOrigenId: nuevo.ejercicioOrigenPgc,
        digitosSubcuenta: nuevo.digitosSubcuenta,
    });
    return nuevo.id;
};

export const patchGenerarPgc = async (id: string, datos: GenerarPgc): Promise<void> => {
    await RestAPI.patch(
        `${baseUrl}/${id}/generar_pgc`,
        generarPgcAApi(datos),
        tContabilidad("ejercicio.errorAlGenerarElPlanContable"),
    );
};

export const getEjercicioActual = async (): Promise<string | null> => {
    const respuesta = await RestAPI.get<{ datos: { ejercicio_id: string | null } }>(
        `${baseUrl}/actual`,
    );
    return respuesta.datos.ejercicio_id;
};

export const patchEjercicioActual = async (id: string): Promise<void> => {
    await RestAPI.patch(
        `${baseUrl}/actual`,
        { ejercicio_id: id },
        tContabilidad("ejercicio.errorAlCambiarElEjercicioActual"),
    );
};

export const opcionesCierreAApi = (opciones: OpcionesCierre) => ({
    fecha: fechaAApi(opciones.fecha),
    regularizar: opciones.regularizar,
    cerrar: opciones.cerrar,
    abrir: opciones.abrir,
    ...(opciones.ejercicioDestinoId
        ? { ejercicio_destino_id: opciones.ejercicioDestinoId }
        : {}),
    ignorar_cuentas_sin_codigo_balance: opciones.ignorarCuentasSinCodigoBalance,
});

interface ResultadoCierreApi {
    asiento_pyg_id: number | null;
    asiento_cierre_id: number | null;
    asiento_apertura_id: number | null;
    ejercicio_destino_id: string | null;
    ejercicio_destino_creado: boolean;
}

export const patchCerrarEjercicio = async (
    id: string,
    opciones: OpcionesCierre
): Promise<ResultadoCierre> => {
    // RestAPI.patch se declara sin respuesta, pero devuelve el JSON.
    const r = (await RestAPI.patch(
        `${baseUrl}/${id}/cerrar`,
        opcionesCierreAApi(opciones),
        tContabilidad("ejercicio.errorAlCerrarElEjercicio"),
    )) as unknown as ResultadoCierreApi;
    return {
        asientoPygId: r.asiento_pyg_id,
        asientoCierreId: r.asiento_cierre_id,
        asientoAperturaId: r.asiento_apertura_id,
        ejercicioDestinoId: r.ejercicio_destino_id,
        ejercicioDestinoCreado: r.ejercicio_destino_creado,
    };
};

export const patchDeshacerCierre = async (id: string): Promise<void> => {
    await RestAPI.patch(
        `${baseUrl}/${id}/deshacer_cierre`,
        {},
        tContabilidad("ejercicio.errorAlDeshacerElCierre"),
    );
};

const urlEjercicioFacturacion = (id: string) =>
    `${urls.EJERCICIO_ALTA}/${encodeURIComponent(id)}`;

/** Nombre y fechas (`ejercicios.ui`); la longitud de subcuenta va por la
 * contabilidad, que no la deja cambiar si ya hay PGC. */
export const patchDatosEjercicio = async (
    id: string,
    cambios: { nombre?: string; fechaInicio?: Date; fechaFin?: Date; digitosSubcuenta?: number },
): Promise<void> => {
    const datos: Record<string, string> = {};
    if (cambios.nombre !== undefined) datos.nombre = cambios.nombre;
    if (cambios.fechaInicio) datos.fecha_inicio = fechaAApi(cambios.fechaInicio);
    if (cambios.fechaFin) datos.fecha_fin = fechaAApi(cambios.fechaFin);
    if (Object.keys(datos).length > 0) {
        await RestAPI.patch(urlEjercicioFacturacion(id), datos, tContabilidad("ejercicio.errorAlGuardarElEjercicio"));
    }
    if (cambios.digitosSubcuenta !== undefined) {
        await RestAPI.patch(
            `${baseUrl}/${id}`,
            { digitos_subcuenta: cambios.digitosSubcuenta },
            tContabilidad("ejercicio.errorAlCambiarLaLongitudDe"),
        );
    }
};

interface SerieEjercicioApi {
    id: number;
    serie_id: string;
    descripcion: string | null;
}

export const serieEjercicioDesdeApi = (api: SerieEjercicioApi): SerieEjercicio => ({
    id: String(api.id),
    serieId: api.serie_id,
    descripcion: api.descripcion ?? "",
});

export const getSeriesEjercicio = async (id: string): Promise<SerieEjercicio[]> => {
    const respuesta = await RestAPI.get<{ datos: SerieEjercicioApi[] }>(
        `${urlEjercicioFacturacion(id)}/serie`,
    );
    return respuesta.datos.map(serieEjercicioDesdeApi);
};

export const postSerieEjercicio = async (id: string, serieId: string): Promise<void> => {
    await RestAPI.post(
        `${urlEjercicioFacturacion(id)}/serie`, { serie_id: serieId },
        tContabilidad("ejercicio.errorAlAnadirLaSerieAl"),
    );
};

export const deleteSerieEjercicio = async (id: string, serieId: string): Promise<void> => {
    await RestAPI.delete(
        `${urlEjercicioFacturacion(id)}/serie/${encodeURIComponent(serieId)}`,
        tContabilidad("ejercicio.errorAlQuitarLaSerieDel"),
    );
};

/** Botón «Copiar series» de `ejercicios.ui`. */
export const postCopiarSeries = async (id: string, ejercicioOrigenId: string): Promise<void> => {
    await RestAPI.post(
        `${urlEjercicioFacturacion(id)}/copiar_series`, { ejercicio_origen_id: ejercicioOrigenId },
        tContabilidad("ejercicio.errorAlCopiarLasSeries"),
    );
};

/** Series del maestro (Fiscalidad > Series) para elegir la que se añade. */
export const getOpcionesSeries = async (): Promise<{ valor: string; descripcion: string }[]> => {
    const respuesta = await RestAPI.get<{ datos: { id: string; descripcion: string | null }[] }>(
        "/comun/serie_facturacion",
    );
    return respuesta.datos.map((s) => ({
        valor: s.id,
        descripcion: s.descripcion ? `${s.id} — ${s.descripcion}` : s.id,
    }));
};

/** Tabla de asientos del ejercicio: número, fecha, concepto e importe de
 * cada asiento enlazado. Si uno ya no existe (borrado desde contabilidad) se
 * enseña la fila sin datos. */
export const getFilasAsientosEjercicio = async (
    ejercicio: Ejercicio,
): Promise<FilaAsientoEjercicio[]> =>
    Promise.all(asientosDelEjercicio(ejercicio).map(async ({ tipo, titulo, asientoId }) => {
        const vacia: FilaAsientoEjercicio = {
            id: asientoId, tipo, titulo, numero: null, ejercicioId: ejercicio.id,
            fecha: null, concepto: tContabilidad("ejercicio.noSeEncuentraElAsiento"), importe: null,
        };
        try {
            const a = await getAsiento(asientoId);
            return {
                ...vacia,
                numero: a.numero,
                ejercicioId: a.ejercicioId || ejercicio.id,
                fecha: a.fecha,
                concepto: a.concepto,
                importe: a.importe,
            };
        } catch {
            return vacia;
        }
    }));
