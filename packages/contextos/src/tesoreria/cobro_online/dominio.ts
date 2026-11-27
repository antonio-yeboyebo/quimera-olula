import { formatearMoneda, plugin } from "@olula/lib/dominio.ts";
import { CobroOnline, EstadoCobroOnline, ReembolsoPasarela } from "./diseño.ts";
import { tTesoreria } from "../i18n/index.ts";

const SIN_PASARELA = ["", "inactivo", "noconfigurado"];

/** Si la instalación tiene una pasarela de pago (whoami `plugins.stripe`).
 * Que la empresa haya conectado su cuenta lo dice el backend al generar el enlace. */
export const pasarelaPagoActiva = (): boolean =>
    !SIN_PASARELA.includes(plugin("stripe").toLowerCase());

export const TEXTO_ESTADO: Record<EstadoCobroOnline, string> = {
    get pendiente() { return tTesoreria("cobro_online.pendienteDePago"); },
    get pagado() { return tTesoreria("cobro_online.pagado"); },
    get cancelado() { return tTesoreria("cobro_online.cancelado"); },
    get caducado() { return tTesoreria("cobro_online.caducado"); },
    get reembolsado() { return tTesoreria("cobro_online.reembolsado"); },
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
    get pagado_tras_cancelar() { return tTesoreria("cobro_online.elClientePagoDespuesDeCancelarse"); },
    get recibo_ya_pagado() { return tTesoreria("cobro_online.elReciboYaEstabaPagadoPor"); },
    get recibo_no_apuntado() { return tTesoreria("cobro_online.noSePudoMarcarElRecibo"); },
    get importe_distinto() { return tTesoreria("cobro_online.loCobradoNoCoincideConLo"); },
    get cuenta_no_configurada() { return tTesoreria("cobro_online.laCredencialDeStripeNoIndica"); },
    get reembolso() { return tTesoreria("cobro_online.seHaDevueltoElDineroEn"); },
    get reembolso_sin_pago() { return tTesoreria("cobro_online.stripeHaNotificadoUnReembolsoDe"); },
    get disputa() { return tTesoreria("cobro_online.elClienteHaDisputadoElCargo"); },
};

export const textoIncidencia = (incidencia: string): string =>
    TEXTO_INCIDENCIA[incidencia] ?? tTesoreria("cobro_online.incidenciaIncidencia", { incidencia });

export const conIncidencia = (cobros: CobroOnline[]): CobroOnline[] =>
    cobros.filter((c) => c.incidencia);

/** El enlace vigente: el último pendiente, que es el que se comparte. */
export const enlaceVigente = (cobros: CobroOnline[]): CobroOnline | null =>
    cobros.find((c) => c.estado === "pendiente" && c.url) ?? null;

/** Texto de la casilla del modal de devolver un recibo cobrado con tarjeta. */
export const textoReembolsoPasarela = (r: ReembolsoPasarela): string =>
    tTesoreria("cobro_online.reembolsarTambienImporteEnStripeValor", { importe: formatearMoneda(r.importe, r.divisaId), valor: (r.modo === "test" ? tTesoreria("cobro_online.modoTest") : ""), valor2: (r.total ? "" : tTesoreria("cobro_online.laParteDeEsteReciboEn")) });

export const emailValido = (email: string): boolean => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
