import { puede } from "@olula/lib/dominio.ts";
import { ElementoMenu, ElementoMenuPadre } from "@olula/lib/menu.ts";
import {
    AccionNavegacion, Capacidad, EventoStreamIa, MensajeAsistente, RespuestaIa,
    HiloIa, MensajeHiloIa, MensajesHiloIa, AdjuntoHiloIa, AdjuntoIa, AdjuntoMensaje,
} from "#/asistente/diseño.ts";

export const construirUrlNavegacion = (accion: AccionNavegacion): string => {
    // El LLM decide `ruta` en tiempo real (ver enlaceFila en el asistente) y a veces se
    // inventa un placeholder o query string propios (ej. "/ventas/pedido?id={id}") en
    // vez de una ruta limpia — se descarta cualquier "?..." que ya traiga para no acabar
    // con dos querystrings concatenadas.
    const ruta = accion.ruta.split("?")[0];
    if (!accion.parametros || Object.keys(accion.parametros).length === 0) return ruta;
    return `${ruta}?${new URLSearchParams(accion.parametros).toString()}`;
};

/** El backend puede devolver en `accion.descripcion` la descripción larga pensada para el
 * LLM en vez del nombre corto de pantalla acordado en el contrato (o no reconocer aún el
 * campo `nombre` de `Capacidad`) — las capacidades locales (derivadas del menú) son la
 * fuente de verdad para el nombre corto, así que se cruza por `ruta` y se sobreescribe con
 * ese nombre; solo si no hay coincidencia se conserva lo que mandó el backend. */
export const accionNavegacionConNombreCorto = (
    accion: AccionNavegacion, capacidades: Capacidad[]
): AccionNavegacion => {
    const ruta = accion.ruta.split("?")[0];
    const capacidad = capacidades.find(c => c.ruta === ruta);
    return capacidad ? { ...accion, descripcion: capacidad.nombre } : accion;
};

export const construirCapacidades = (menu: ElementoMenu[]): Capacidad[] => {
    const hojas = menu.flatMap(item =>
        "subelementos" in item ? (item as ElementoMenuPadre).subelementos : [item]
    );

    return hojas
        .filter(hoja => Boolean(hoja.descripcionIA))
        .filter(hoja => !hoja.regla || puede(hoja.regla))
        .map(hoja => ({
            ruta: hoja.url,
            nombre: hoja.nombre,
            descripcion: hoja.descripcionIA!,
            parametros: hoja.parametrosIA,
            regla: hoja.regla,
        }));
};

export const adjuntoHiloDesdeApi = (raw: Record<string, unknown>): AdjuntoHiloIa => ({
    id: String(raw.id ?? ""),
    nombre: String(raw.nombre ?? ""),
    tipoMime: String(raw.tipo_mime ?? ""),
});

export const normalizarRespuestaIa = (raw: Record<string, unknown>): RespuestaIa => ({
    respuesta: String(raw.respuesta ?? ""),
    threadId: String(raw.thread_id ?? ""),
    a2uiMessages: Array.isArray(raw.a2ui_messages) ? raw.a2ui_messages : [],
    capacidadesHash: (raw.capacidades_hash as string | null | undefined) ?? null,
    necesitaCapacidades: Boolean(raw.necesita_capacidades),
    accionNavegacion: (raw.accion_navegacion as RespuestaIa["accionNavegacion"]) ?? null,
    adjuntos: Array.isArray(raw.adjuntos)
        ? (raw.adjuntos as Record<string, unknown>[]).map(adjuntoHiloDesdeApi)
        : [],
});

export const mensajeVacio = (id: string, rol: MensajeAsistente["rol"]): MensajeAsistente => ({
    id,
    rol,
    texto: "",
});

/** Adjuntos locales (con datosBase64 en memoria) -> forma que espera ConsultaIa. Descarta
 * cualquier adjunto sin datosBase64 (no debería darse — un adjunto local siempre lo
 * tiene en el momento de enviarse) en vez de mandar un dato incompleto al backend. */
export const adjuntosParaEnviar = (adjuntos: AdjuntoMensaje[] | undefined): AdjuntoIa[] | undefined => {
    if (!adjuntos?.length) return undefined;
    const completos = adjuntos.filter((a): a is AdjuntoMensaje & { datosBase64: string } => Boolean(a.datosBase64));
    if (!completos.length) return undefined;
    return completos.map(a => ({ nombre: a.nombre, tipoMime: a.tipoMime, datosBase64: a.datosBase64 }));
};

export const hiloDesdeApi = (raw: Record<string, unknown>): HiloIa => ({
    threadId: String(raw.thread_id ?? ""),
    titulo: String(raw.titulo ?? ""),
    actualizadoEn: String(raw.actualizado_en ?? ""),
});

export const mensajeHiloDesdeApi = (raw: Record<string, unknown>): MensajeHiloIa => ({
    id: String(raw.id ?? ""),
    rol: raw.rol === "user" ? "user" : "assistant",
    texto: String(raw.texto ?? ""),
    a2uiMessages: Array.isArray(raw.a2ui_messages) ? raw.a2ui_messages : [],
    adjuntos: Array.isArray(raw.adjuntos)
        ? (raw.adjuntos as Record<string, unknown>[]).map(adjuntoHiloDesdeApi)
        : [],
});

export const mensajesHiloDesdeApi = (raw: Record<string, unknown>): MensajesHiloIa => ({
    threadId: String(raw.thread_id ?? ""),
    mensajes: Array.isArray(raw.mensajes)
        ? (raw.mensajes as Record<string, unknown>[]).map(mensajeHiloDesdeApi)
        : [],
});

export const eventoStreamDesdeApi = (raw: Record<string, unknown>): EventoStreamIa => {
    switch (raw.tipo) {
        case "delta":
            return { tipo: "delta", contenido: String(raw.contenido ?? "") };
        case "estado":
            return { tipo: "estado", contenido: String(raw.contenido ?? "") };
        case "a2ui":
            return { tipo: "a2ui", a2uiMessage: raw.a2ui_message };
        case "accion_navegacion":
            return { tipo: "accion_navegacion", accionNavegacion: raw.accion_navegacion as AccionNavegacion };
        case "fin":
            return {
                tipo: "fin",
                threadId: String(raw.thread_id ?? ""),
                necesitaCapacidades: Boolean(raw.necesita_capacidades),
                adjuntos: Array.isArray(raw.adjuntos)
                    ? (raw.adjuntos as Record<string, unknown>[]).map(adjuntoHiloDesdeApi)
                    : [],
            };
        case "error":
        default:
            return { tipo: "error", contenido: String(raw.contenido ?? "Error desconocido del asistente") };
    }
};
