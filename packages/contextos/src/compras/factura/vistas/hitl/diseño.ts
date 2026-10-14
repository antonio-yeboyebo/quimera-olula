import { Entidad, Modelo } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";

/** Línea de factura con todos los campos opcionales (pueden llegar null del LLM). */
export interface LineaFacturaHitl extends Entidad {
    articuloId: string | null;
    /** Descripción del artículo seleccionado, campo secundario del selector. */
    articuloDescripcion: string | null;
    descripcion: string | null;
    cantidad: string | null;
    precioUnitario: string | null;
    descuento: string | null;
}

/**
 * Modelo de factura para la resolución HITL.
 * Los campos pueden llegar nulos cuando el LLM no los pudo extraer.
 * `camposFaltantes` indica los campos que el LLM marcó explícitamente como no resueltos.
 */
export interface FacturaHitl extends Modelo {
    proveedorId: string | null;
    proveedorNombre: string | null;
    numeroProveedor: string | null;
    fecha: string | null;
    total: string | null;
    lineas: LineaFacturaHitl[];
    camposFaltantes: string[];
    ficheroOrigen: string | null;
}

export const metaLineaFacturaHitl: MetaModelo<LineaFacturaHitl> = {
    campos: {
        articuloId: {},
        articuloDescripcion: { tipo: "texto" },
        descripcion: { tipo: "texto" },
        cantidad: { tipo: "decimal", decimales: 2 },
        precioUnitario: { tipo: "moneda", decimales: 2 },
        descuento: { tipo: "decimal", decimales: 2 },
    },
};

export const metaFacturaHitl: MetaModelo<FacturaHitl> = {
    campos: {
        /** Requerido: el servidor lanza error si no hay proveedor. */
        proveedorId: { requerido: true },
        proveedorNombre: { tipo: "texto" },
        numeroProveedor: { tipo: "texto" },
        fecha: { tipo: "texto" },
        total: { tipo: "moneda", decimales: 2 },
        lineas: { itemMeta: metaLineaFacturaHitl },
    },
};

/** Devuelve true si el campo necesita un input (está en faltantes o es null). */
export const necesitaInput = (
    camposFaltantes: string[],
    campoKey: string,
    valor: string | null,
): boolean => camposFaltantes.includes(campoKey) || valor === null;

/** Idem para campos de línea con prefijo `linea[idx].campo`. */
export const lineaNecesitaInput = (
    camposFaltantes: string[],
    idx: number,
    campoKey: string,
    valor: string | null,
): boolean =>
    camposFaltantes.includes(`linea[${idx}].${campoKey}`) || valor === null;
