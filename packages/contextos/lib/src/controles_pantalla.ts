import { useEffect, useRef } from "react";
import { ClausulaFiltro } from "./diseño.ts";
import { tLib } from "./i18n/textos.ts";

/**
 * Registro de los controles de la pantalla actual que se pueden manejar por voz (o
 * desde el chat del asistente): listados, pestañas, detalle y modales. Cada componente
 * compartido montado se registra con qué muestra y qué se puede hacer con él, y lo
 * ejecuta él mismo con sus propios callbacks — igual que si el usuario hubiera hecho
 * click, así que funciona en cualquier módulo sin tocarlo.
 *
 * Solo acciones de consulta (filtrar, ordenar, abrir, cambiar de pestaña, cerrar):
 * nada que guarde ni borre.
 */

export type TipoCampoVoz = "texto" | "booleano" | "fechas" | "numeros" | "mes" | "opciones";

export interface CampoFiltroVoz {
    id: string;
    etiqueta: string;
    tipo: TipoCampoVoz;
    opciones?: { valor: string; etiqueta: string }[];
}

export interface DescripcionListado {
    tipo: "listado";
    id: string;
    campos: CampoFiltroVoz[];
    columnasOrden: { id: string; etiqueta: string }[];
    filtro: ClausulaFiltro[];
    orden: string[];
    pagina: number;
    total: number;
    /** Filas visibles (las primeras): posición 1..n, id y un resumen legible. */
    filas: { posicion: number; id: string; texto: string }[];
    seleccionada: { id: string; texto: string | null } | null;
    modo: string | null;
    modos: string[];
}

export interface DescripcionPestanas {
    tipo: "pestanas";
    id: string;
    pestanas: string[];
    activa: number;
}

export interface DescripcionDetalle {
    tipo: "detalle";
    id: string;
}

export interface DescripcionModal {
    tipo: "modal";
    id: string;
    titulo: string;
}

export type DescripcionControl = DescripcionListado | DescripcionPestanas | DescripcionDetalle | DescripcionModal;
export type TipoControl = DescripcionControl["tipo"];

export interface ResultadoAccionPantalla {
    ok: boolean;
    /** Frase corta para confirmar (o explicar el fallo) en voz alta. */
    mensaje?: string;
}

export interface AccionPantalla {
    control: string;
    accion: string;
    parametros: Record<string, unknown>;
}

export interface ControlPantalla {
    /** `id` lo pone el registro: aquí se puede dejar vacío. */
    describir: () => DescripcionControl;
    ejecutar: (accion: string, parametros: Record<string, unknown>) => ResultadoAccionPantalla;
}

const controles = new Map<string, ControlPantalla>();
const contadores: Partial<Record<TipoControl, number>> = {};

/** Registra un control (devuelve la función para darlo de baja). Los ids son
 * estables mientras siga montado: "listado-1", "pestanas-1"… */
export const registrarControl = (tipo: TipoControl, control: ControlPantalla): (() => void) => {
    contadores[tipo] = (contadores[tipo] ?? 0) + 1;
    const id = `${tipo}-${contadores[tipo]}`;
    controles.set(id, control);
    return () => {
        controles.delete(id);
    };
};

/** Descripción de todos los controles montados, en orden de registro. */
export const describirPantalla = (): DescripcionControl[] =>
    [...controles.entries()].map(([id, control]) => ({ ...control.describir(), id }));

export const ejecutarAccionPantalla = ({ control, accion, parametros }: AccionPantalla): ResultadoAccionPantalla => {
    const destino = controles.get(control);
    if (!destino) return { ok: false, mensaje: tLib("gen.controlesPantalla.eseElementoYaNoEstaEn") };
    try {
        return destino.ejecutar(accion, parametros ?? {});
    } catch {
        return { ok: false, mensaje: tLib("gen.controlesPantalla.noHePodidoHacerlo") };
    }
};

/**
 * Registra el control mientras el componente esté montado (y `activo`). `crear` se
 * vuelve a evaluar en cada render, así que describe y ejecuta siempre con las props y
 * el estado más recientes, sin re-registrarse.
 */
export const useControlPantalla = (tipo: TipoControl, crear: () => ControlPantalla, activo = true): void => {
    const crearRef = useRef(crear);
    useEffect(() => {
        crearRef.current = crear;
    });
    useEffect(() => {
        if (!activo) return;
        return registrarControl(tipo, {
            describir: () => crearRef.current().describir(),
            ejecutar: (accion, parametros) => crearRef.current().ejecutar(accion, parametros),
        });
    }, [tipo, activo]);
};

/** Solo para tests. */
export const limpiarControlesPantalla = (): void => {
    controles.clear();
    for (const tipo of Object.keys(contadores) as TipoControl[]) delete contadores[tipo];
};
