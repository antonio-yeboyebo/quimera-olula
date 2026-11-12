import { formatearMoneda, plugin } from "@olula/lib/dominio.ts";
import { CobroOnline, EstadoCobroOnline, ReembolsoPasarela } from "./diseño.ts";

const SIN_PASARELA = ["", "inactivo", "noconfigurado"];

/** Si la instalación tiene una pasarela de pago (whoami `plugins.stripe`).
 * Que la empresa haya conectado su cuenta lo dice el backend al generar el enlace. */
export const pasarelaPagoActiva = (): boolean =>
    !SIN_PASARELA.includes(plugin("stripe").toLowerCase());

export const TEXTO_ESTADO: Record<EstadoCobroOnline, string> = {
    pendiente: "Pendiente de pago",
    pagado: "Pagado",
    cancelado: "Cancelado",
    caducado: "Caducado",
    reembolsado: "Reembolsado",
};

export const VARIANTE_ESTADO: Record<EstadoCobroOnline, "exito" | "advertencia" | "neutro" | "error"> = {
    pendiente: "advertencia",
    pagado: "exito",
    cancelado: "neutro",
    caducado: "neutro",
    reembolsado: "error",
};

/** Qué tiene que revisar alguien, por cada incidencia que deja el webhook. */
export const TEXTO_INCIDENCIA: Record<string, string> = {
    pagado_tras_cancelar: "El cliente pagó después de cancelarse el cobro: hay que devolverle el dinero.",
    recibo_ya_pagado: "El recibo ya estaba pagado por otro medio: revisa si hay que devolver el pago con tarjeta.",
    recibo_no_apuntado: "No se pudo marcar el recibo como pagado: apúntalo a mano.",
    importe_distinto: "Lo cobrado no coincide con lo pendiente: los recibos no se han tocado.",
    cuenta_no_configurada: "La credencial de Stripe no indica la cuenta de los cobros: el recibo no se ha marcado como pagado.",
    reembolso: "Se ha devuelto el dinero en Stripe; el recibo sigue pagado en Olula.",
    reembolso_sin_pago: "Stripe ha notificado un reembolso de un cobro que no constaba como pagado.",
    disputa: "El cliente ha disputado el cargo con su banco.",
};

export const textoIncidencia = (incidencia: string): string =>
    TEXTO_INCIDENCIA[incidencia] ?? `Incidencia: ${incidencia}`;

export const conIncidencia = (cobros: CobroOnline[]): CobroOnline[] =>
    cobros.filter((c) => c.incidencia);

/** El enlace vigente: el último pendiente, que es el que se comparte. */
export const enlaceVigente = (cobros: CobroOnline[]): CobroOnline | null =>
    cobros.find((c) => c.estado === "pendiente" && c.url) ?? null;

/** Texto de la casilla del modal de devolver un recibo cobrado con tarjeta. */
export const textoReembolsoPasarela = (r: ReembolsoPasarela): string =>
    `Reembolsar también ${formatearMoneda(r.importe, r.divisaId)} en Stripe` +
    (r.modo === "test" ? " (modo test)" : "") +
    (r.total ? "" : ", la parte de este recibo en el cobro con tarjeta de la factura");

export const emailValido = (email: string): boolean => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
