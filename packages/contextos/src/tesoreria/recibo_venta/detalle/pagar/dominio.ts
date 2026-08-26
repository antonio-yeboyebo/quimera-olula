import { MetaModelo } from "@olula/lib/dominio.js";
import { PagoRecibo } from "./diseño.js";

export const pagoReciboVacio: PagoRecibo = {
    cuenta_pago_id: "",
    nombre_cuenta_pago: "",
    fecha: new Date(),
};

export const metaPagoRecibo: MetaModelo<PagoRecibo> = {
    campos: {
        cuenta_pago_id: { requerido: true },
        fecha: { tipo: "fecha", requerido: true },
    },
};
