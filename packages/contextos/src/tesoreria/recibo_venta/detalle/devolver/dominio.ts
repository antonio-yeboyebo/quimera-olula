import { MetaModelo } from "@olula/lib/dominio.js";
import { ReciboVenta } from "../../diseño.js";
import { cuentaUltimoPago } from "../../dominio.js";
import { DevolucionRecibo } from "./diseño.js";
import { tTesoreria } from "../../../i18n/index.ts";

/** La cuenta se precarga con la del último pago y no se puede cambiar. */
export const devolucionReciboVacia = (recibo: ReciboVenta): DevolucionRecibo => {
    const cuenta = cuentaUltimoPago(recibo);
    return {
        cuenta_pago_id: cuenta?.id ?? "",
        nombre_cuenta_pago: cuenta?.nombre ?? "",
        fecha: new Date(),
        tasa_conversion: 0,
    };
};

/** En divisa extranjera la tasa de cambio es obligatoria. */
export const metaDevolucionRecibo = (enDivisa: boolean): MetaModelo<DevolucionRecibo> => ({
    campos: {
        cuenta_pago_id: { requerido: true },
        fecha: { tipo: "fecha", requerido: true },
        tasa_conversion: {
            tipo: "numero",
            requerido: enDivisa,
            validacion: (m) => !enDivisa || m.tasa_conversion > 0
                ? true : tTesoreria("recibo_venta.laTasaDeCambioDebeSer"),
        },
    },
});
