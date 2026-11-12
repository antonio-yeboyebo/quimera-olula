/**
 * Canal entre el TPV y el visor de cliente (/tpv/visor), abierto en otra
 * ventana del mismo navegador, normalmente en la pantalla que mira al cliente.
 * BroadcastChannel: sin servidor de por medio, solo entre pestañas del mismo origen.
 *
 * El TPV guarda una copia de lo que ha enviado; así, si el visor se abre (o se
 * recarga) a mitad de una venta, pide el estado y lo recibe entero.
 */
import { EstadoVisor, MensajeVisor } from "./diseño.ts";
import { aplicarMensajeVisor, estadoVisorVacio } from "./dominio.ts";

export type { MensajeVisor } from "./diseño.ts";

export const NOMBRE_CANAL = "olula-tpv-visor";

const abrirCanal = (): BroadcastChannel | null =>
    typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(NOMBRE_CANAL);

// Lado TPV: un canal persistente que además contesta a las peticiones del visor.
let canalTpv: BroadcastChannel | null = null;
let estadoEnviado: EstadoVisor = estadoVisorVacio;

const obtenerCanalTpv = (): BroadcastChannel | null => {
    if (canalTpv) return canalTpv;
    canalTpv = abrirCanal();
    if (canalTpv) {
        canalTpv.onmessage = (evento: MessageEvent<MensajeVisor>) => {
            if (evento.data?.tipo === "solicitar_estado") {
                canalTpv?.postMessage({ tipo: "estado", estado: estadoEnviado } satisfies MensajeVisor);
            }
        };
    }
    return canalTpv;
};

export const publicarEnVisor = (mensaje: MensajeVisor): void => {
    estadoEnviado = aplicarMensajeVisor(estadoEnviado, mensaje);
    obtenerCanalTpv()?.postMessage(mensaje);
};

/** Lado visor: escucha al TPV y le pide lo que tenga en pantalla. */
export const escucharVisor = (alRecibir: (mensaje: MensajeVisor) => void): (() => void) => {
    const canal = abrirCanal();
    if (!canal) return () => {};
    canal.onmessage = (evento: MessageEvent<MensajeVisor>) => alRecibir(evento.data);
    canal.postMessage({ tipo: "solicitar_estado" } satisfies MensajeVisor);
    return () => canal.close();
};

/** Solo para tests: olvida el estado y cierra el canal del lado TPV. */
export const reiniciarCanalTpv = (): void => {
    canalTpv?.close();
    canalTpv = null;
    estadoEnviado = estadoVisorVacio;
};
