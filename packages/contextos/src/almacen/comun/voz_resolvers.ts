import { RestAPI } from "@olula/lib/api/rest_api.js";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";

// --- Caja ---

interface TagCajaApi {
    id: string;
    lpn: string;
    ubicacion_id: string;
    contenedor_id: string | null;
    sku?: string | null;
    lote_id?: string | null;
    cantidad: number | null;
    capacidad?: number | null;
}

export interface CajaResuelta {
    id: string;
    lpn: string;
    cantidad: number | null;
    capacidad: number | null;
}

export interface CajaCompletaResuelta {
    id: string;
    lpn: string;
    sku: string | null;
    idLote: string | null;
    capacidad: number | null;
}

const normalizarLpn = (texto: string): string => {
    const sinEspacios = texto.replace(/\s+/g, "");
    // Si ya tiene prefijo BX- (dictado completo), dejarlo tal cual
    if (/^bx-/i.test(sinEspacios)) return sinEspacios;
    // Si es solo la parte numérica, añadir prefijo
    return `BX-${sinEspacios}`;
};

export const buscarCajaPorTexto = async (texto: string): Promise<CajaResuelta | null> => {
    const limpio = normalizarLpn(texto);
    const criteria: Criteria = {
        ...criteriaDefecto,
        filtro: [["lpn", "~", limpio]],
        orden: ["lpn", "ASC"],
    };

    const respuesta = await RestAPI.getQuery<TagCajaApi, TagCajaApi>(
        "/almacen/caja",
        criteria,
        (c) => c,
    );

    const cajas = respuesta.datos;
    if (cajas.length === 0) return null;

    // Priorizar coincidencia exacta
    const exacta = cajas.find((c) => c.lpn.toLowerCase() === limpio.toLowerCase());
    const elegida = exacta ?? cajas[0];

    return {
        id: elegida.id,
        lpn: elegida.lpn,
        cantidad: elegida.cantidad,
        capacidad: elegida.capacidad ?? null,
    };
};

export const buscarCajaCompletaPorTexto = async (texto: string): Promise<CajaCompletaResuelta | null> => {
    const limpio = normalizarLpn(texto);
    const criteria: Criteria = {
        ...criteriaDefecto,
        filtro: [["lpn", "~", limpio]],
        orden: ["lpn", "ASC"],
    };

    const respuesta = await RestAPI.getQuery<TagCajaApi, TagCajaApi>(
        "/almacen/caja",
        criteria,
        (c) => c,
    );

    const cajas = respuesta.datos;
    if (cajas.length === 0) return null;

    const exacta = cajas.find((c) => c.lpn.toLowerCase() === limpio.toLowerCase());
    const elegida = exacta ?? cajas[0];

    return {
        id: elegida.id,
        lpn: elegida.lpn,
        sku: elegida.sku ?? null,
        idLote: elegida.lote_id ?? null,
        capacidad: elegida.capacidad ?? null,
    };
};

// --- Ubicación ---

interface TagUbicacionApi {
    id: string;
    codigo: string;
}

export interface UbicacionResuelta {
    id: string;
    codigo: string;
}

export const buscarUbicacionPorTexto = async (texto: string): Promise<UbicacionResuelta | null> => {
    const limpio = texto.replace(/\s+/g, "");
    const criteria: Criteria = {
        ...criteriaDefecto,
        filtro: [["codigo", "~", limpio]],
        orden: ["codigo", "ASC"],
    };

    const respuesta = await RestAPI.getQuery<TagUbicacionApi, TagUbicacionApi>(
        "/almacen/ubicacion",
        criteria,
    );

    const ubicaciones = respuesta.datos;
    if (ubicaciones.length === 0) return null;

    const exacta = ubicaciones.find((u) => u.codigo.toLowerCase() === limpio.toLowerCase());
    const elegida = exacta ?? ubicaciones[0];

    return {
        id: elegida.id,
        codigo: elegida.codigo,
    };
};
