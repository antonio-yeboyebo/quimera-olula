import { AgenteTpv } from "../agente/diseño.ts";
import { PuntoVentaTpv } from "../punto_de_venta/diseño.ts";

const CLAVE_PUNTO_VENTA = "punto-venta-tpv-local";

export const puntoVentaLocal = {

    actualizar: (puntoVenta: PuntoVentaTpv) => {
        localStorage.setItem(CLAVE_PUNTO_VENTA, JSON.stringify(puntoVenta));
    },

    obtener: (): PuntoVentaTpv => {
        const puntoVentaStorage = localStorage.getItem(CLAVE_PUNTO_VENTA);
        if (puntoVentaStorage) {
            const puntoVenta = JSON.parse(puntoVentaStorage);
            return puntoVenta
        }
        throw new Error("No hay punto de venta activo");
    },

    obtenerSeguro: (): PuntoVentaTpv | null => {
        const puntoVentaStorage = localStorage.getItem(CLAVE_PUNTO_VENTA);
        if (puntoVentaStorage) {
            const puntoVenta = JSON.parse(puntoVentaStorage);
            return puntoVenta
        }
        return null;
    },

    borrar: () => {
        localStorage.removeItem(CLAVE_PUNTO_VENTA);
    },
}

const CLAVE_AGENTE_TPV = "agente-tpv-local";

export const agenteActivo = {

    actualizar: (agente: AgenteTpv) => {
        localStorage.setItem(CLAVE_AGENTE_TPV, JSON.stringify(agente));
    },

    obtener: (): AgenteTpv => {
        const agenteStorage = localStorage.getItem(CLAVE_AGENTE_TPV);
        console.log('agenteStorage', agenteStorage)
        if (agenteStorage) {
            const agente = JSON.parse(agenteStorage);
            return agente
        }
        throw new Error("No hay agente activo");
    },

    obtenerSegudo: (): AgenteTpv | null => {
        const agenteStorage = localStorage.getItem(CLAVE_AGENTE_TPV);
        console.log('agenteStorage', agenteStorage)
        if (agenteStorage) {
            const agente = JSON.parse(agenteStorage);
            return agente
        }
        return null;
    },

    borrar: () => {
        localStorage.removeItem(CLAVE_PUNTO_VENTA);
    },
}