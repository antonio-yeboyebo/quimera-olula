import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ComunUrls from "../urls.ts";
import {
    BuscarArchivosDrive, CambiosCredencialExterna, CategoriaCredencialExterna, CredencialExterna,
    DeleteCredencialExterna, GetCredencialesExterna, GetCredencialExterna, ItemArchivoConector,
    PatchCredencialExterna, PostCredencialExterna, RotarSecretoCredencialExterna, SecretoCredencialExterna,
    TipoAuthCredencialExterna,
} from "./diseño.ts";

export interface CredencialExternaApi {
    id: string;
    empresa_id: string;
    nombre: string;
    proveedor: string;
    tipo_auth: TipoAuthCredencialExterna;
    activo: boolean;
    creado_por: string;
    creado_en: string;
    actualizado_en: string;
    propietario_id: string | null;
    categoria: CategoriaCredencialExterna;
}

interface ItemArchivoConectorApi {
    id: string;
    nombre: string;
    tipo: string;
    modificado_en: string;
}

interface NuevaCredencialExternaApi {
    empresa_id: string;
    nombre: string;
    proveedor: string;
    tipo_auth: TipoAuthCredencialExterna;
    secreto: SecretoCredencialExterna;
    personal: boolean;
    categoria: CategoriaCredencialExterna;
}

type CambiosCredencialExternaApi = Partial<{
    nombre: string;
    proveedor: string;
    activo: boolean;
    secreto: SecretoCredencialExterna;
}>;

const baseUrl = new ComunUrls().CREDENCIAL_EXTERNA;

export const credencialExternaDesdeApi = (api: CredencialExternaApi): CredencialExterna => ({
    id: api.id,
    empresaId: api.empresa_id,
    nombre: api.nombre,
    proveedor: api.proveedor,
    tipoAuth: api.tipo_auth,
    activo: api.activo,
    creadoPor: api.creado_por,
    creadoEn: new Date(Date.parse(api.creado_en)),
    actualizadoEn: new Date(Date.parse(api.actualizado_en)),
    propietarioId: api.propietario_id,
    categoria: api.categoria,
});

const cambiosCredencialExternaAApi = (m: CambiosCredencialExterna): CambiosCredencialExternaApi => {
    const cambios: CambiosCredencialExternaApi = {};
    if (m.nombre !== undefined) cambios.nombre = m.nombre;
    if (m.proveedor !== undefined) cambios.proveedor = m.proveedor;
    if (m.activo !== undefined) cambios.activo = m.activo;
    return cambios;
};

export const getCredencialExterna: GetCredencialExterna = async (id) => {
    return await RestAPI.getItem<CredencialExterna, CredencialExternaApi>(
        `${baseUrl}/${id}`,
        credencialExternaDesdeApi,
    );
};

export const getCredencialesExterna: GetCredencialesExterna = async (criteria) => {
    return await RestAPI.getQuery<CredencialExterna, CredencialExternaApi>(
        baseUrl,
        criteria,
        credencialExternaDesdeApi,
    );
};

export const postCredencialExterna: PostCredencialExterna = async (nuevaCredencial, secreto) => {
    const respuesta = await RestAPI.post<NuevaCredencialExternaApi>(
        baseUrl,
        {
            empresa_id: nuevaCredencial.empresaId,
            nombre: nuevaCredencial.nombre,
            proveedor: nuevaCredencial.proveedor,
            tipo_auth: nuevaCredencial.tipoAuth,
            secreto,
            personal: nuevaCredencial.personal,
            categoria: nuevaCredencial.categoria,
        },
        "Error al crear la credencial",
    );
    return respuesta.id;
};

export const patchCredencialExterna: PatchCredencialExterna = async (id, cambios) => {
    await RestAPI.patch<CambiosCredencialExternaApi>(
        `${baseUrl}/${id}`,
        cambiosCredencialExternaAApi(cambios),
        "Error al guardar la credencial",
    );
};

export const rotarSecretoCredencialExterna: RotarSecretoCredencialExterna = async (id, secreto) => {
    await RestAPI.patch<CambiosCredencialExternaApi>(
        `${baseUrl}/${id}`,
        { secreto },
        "Error al rotar la credencial",
    );
};

export const deleteCredencialExterna: DeleteCredencialExterna = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        "Error al eliminar la credencial",
    );
};

export const reconectarTelegram = async (id: string): Promise<void> => {
    await RestAPI.post(
        `${baseUrl}/${id}/reconectar-telegram`,
        {},
        "Error al reconectar con Telegram",
    );
};

/** Resultado de «Probar conexión» de una credencial Stripe. */
export interface ConexionStripe {
    modo: "test" | "live";
    /** El entorno no es producción y cobra en test aunque la credencial diga live. */
    modoForzado: boolean;
    cuenta: { id: string; nombre: string; email: string | null; cobrosActivos: boolean };
    webhooks: Record<string, boolean>;
    /** Cuenta bancaria donde se apuntan los cobros; null si no está elegida. */
    cuentaCobros: string | null;
}

/** Comprueba la cuenta de Stripe y da de alta los webhooks que falten. */
export const probarStripe = async (id: string): Promise<ConexionStripe> => {
    const r = (await RestAPI.post(
        `${baseUrl}/${id}/probar-stripe`,
        {},
        "Error al conectar con Stripe",
    )) as unknown as {
        modo: "test" | "live";
        modo_forzado: boolean;
        cuenta: { id: string; nombre: string; email: string | null; cobros_activos: boolean };
        webhooks: Record<string, boolean>;
        cuenta_cobros: string | null;
    };
    return {
        modo: r.modo,
        modoForzado: r.modo_forzado,
        cuenta: {
            id: r.cuenta.id,
            nombre: r.cuenta.nombre,
            email: r.cuenta.email,
            cobrosActivos: r.cuenta.cobros_activos,
        },
        webhooks: r.webhooks,
        cuentaCobros: r.cuenta_cobros ?? null,
    };
};

/**
 * Busca archivos en el conector de Google Drive de una credencial — usado por
 * el buscador del alta "Importar de un conector" de ia_memoria (ver D5 en el
 * plan). `texto` es opcional: sin él, el backend devuelve los más recientes.
 */
export const buscarArchivosDrive: BuscarArchivosDrive = async (id, texto) => {
    const q = texto ? `?q=${encodeURIComponent(texto)}` : "";
    const respuesta = await RestAPI.get<{ datos: ItemArchivoConectorApi[] }>(
        `${baseUrl}/${id}/drive/buscar${q}`,
        "Error al buscar archivos en Google Drive",
    );
    return respuesta.datos.map((a): ItemArchivoConector => ({
        id: a.id,
        nombre: a.nombre,
        tipo: a.tipo,
        modificadoEn: a.modificado_en,
    }));
};

/**
 * Inicia el flujo OAuth2 de Google (Drive/Calendar) — devuelve la URL de
 * consentimiento de Google a la que hay que redirigir el navegador entero
 * (ver DetalleCredencialExterna.tsx: window.location.href = url).
 */
export const iniciarOauthGoogle = async (id: string): Promise<string> => {
    const respuesta = (await RestAPI.post(
        `${baseUrl}/${id}/oauth/iniciar`,
        {},
        "Error al iniciar la conexión con Google",
    )) as unknown as { url: string };
    return respuesta.url;
};
