import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import {
    Agente,
    CambiosAgente,
    GetAgente,
    GetAgentesLista,
    NuevoAgente,
    PatchAgente,
    PostAgente,
} from "./diseño.ts";
import { tVentas } from "../i18n/index.ts";

const baseUrl = new ApiUrls().AGENTE;

type AgenteApi = {
    id: string;
    nombre: string;
    nombre_pila?: string;
    apellidos?: string;
    id_fiscal?: string;
    por_comision?: number;
    telefono?: string | null;
    email?: string | null;
    direccion?: string | null;
    ciudad?: string | null;
    codpostal?: string | null;
    provincia?: string | null;
    usuario_id?: string | null;
};

const CAMPOS_OPCIONALES = [
    "telefono",
    "email",
    "direccion",
    "ciudad",
    "codpostal",
    "provincia",
] as const;

export const agenteDesdeApi = (a: AgenteApi): Agente => ({
    id: a.id,
    nombre: a.nombre,
    nombre_pila: a.nombre_pila ?? "",
    apellidos: a.apellidos ?? "",
    id_fiscal: a.id_fiscal ?? "",
    por_comision: Number(a.por_comision ?? 0),
    telefono: a.telefono ?? null,
    email: a.email ?? null,
    direccion: a.direccion ?? null,
    ciudad: a.ciudad ?? null,
    codpostal: a.codpostal ?? null,
    provincia: a.provincia ?? null,
    usuario_id: a.usuario_id ?? null,
});

const nuevoAgenteAApi = (a: NuevoAgente) => ({
    nombre_pila: a.nombre_pila,
    apellidos: a.apellidos,
    id_fiscal: a.id_fiscal,
    por_comision: Number(a.por_comision),
    telefono: a.telefono || null,
    email: a.email || null,
    direccion: a.direccion || null,
    ciudad: a.ciudad || null,
    codpostal: a.codpostal || null,
    provincia: a.provincia || null,
});

const cambiosAgenteAApi = (c: CambiosAgente): Record<string, unknown> => {
    const cambios: Record<string, unknown> = {};
    if (c.nombre_pila !== undefined) cambios.nombre_pila = c.nombre_pila;
    if (c.apellidos !== undefined) cambios.apellidos = c.apellidos;
    if (c.id_fiscal !== undefined) cambios.id_fiscal = c.id_fiscal;
    if (c.por_comision !== undefined) cambios.por_comision = Number(c.por_comision);
    CAMPOS_OPCIONALES.forEach((campo) => {
        if (c[campo] !== undefined) cambios[campo] = c[campo] || null;
    });

    return cambios;
};

export const getAgentes = async (filtro: Filtro, orden: Orden): Promise<Agente[]> => {
    const q = criteriaQuery(filtro, orden);

    return RestAPI.get<{ datos: AgenteApi[] }>(baseUrl + q).then((respuesta) => respuesta.datos.map(agenteDesdeApi));
}

export const getAgente: GetAgente = async (id) =>
    await RestAPI.getItem<Agente, AgenteApi>(
        `${baseUrl}/${id}`,
        agenteDesdeApi,
        tVentas("agente.errores.obtener")
    );

export const getAgentesLista: GetAgentesLista = async (criteria) =>
    await RestAPI.getQuery<Agente, AgenteApi>(
        baseUrl,
        criteria,
        agenteDesdeApi,
        tVentas("agente.errores.obtenerLista")
    );

export const postAgente: PostAgente = async (nuevo) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        nuevoAgenteAApi(nuevo),
        tVentas("agente.errores.crear")
    );

    return String(respuesta.id);
};

export const patchAgente: PatchAgente = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        { cambios: cambiosAgenteAApi(cambios) },
        tVentas("agente.errores.actualizar")
    );
};
