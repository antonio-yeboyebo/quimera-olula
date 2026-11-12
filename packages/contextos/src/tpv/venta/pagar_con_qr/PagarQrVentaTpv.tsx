import { CodigoQr } from "#/tesoreria/cobro_online/componentes/CodigoQr.tsx";
import { CobroQr } from "#/tesoreria/cobro_online/diseño.ts";
import { textoIncidencia } from "#/tesoreria/cobro_online/dominio.ts";
import {
    getCobroQr,
    postCancelarCobroQr,
    postCobroQr,
} from "#/tesoreria/cobro_online/infraestructura.ts";
import { publicarEnVisor } from "#/tpv/visor/canal.ts";
import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { formatearMoneda } from "@olula/lib/dominio.js";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { VentaTpv } from "../diseño.ts";
import "./PagarQrVentaTpv.css";

/** Cada cuánto se pregunta al servidor si el cliente ya ha pagado. */
export const INTERVALO_CONSULTA_MS = 2000;

/**
 * Cobro con QR: el cliente escanea con su móvil y paga el pendiente de la venta
 * en Stripe. El QR se ve aquí y en el visor de cliente
 * (el "pago recibido" del visor lo publica el detalle, igual para todos los métodos). El pago de la venta lo
 * crea el servidor al recibir el aviso de Stripe; este modal solo espera.
 */
export const PagarQrVentaTpv = ({
    publicar,
    venta,
}: {
    publicar: EmitirEvento;
    venta: VentaTpv;
}) => {
    const { intentar } = useContext(ContextoError);
    const [cobro, setCobro] = useState<CobroQr | null>(null);
    const [esperandoConfirmacion, setEsperandoConfirmacion] = useState(false);
    const terminado = useRef(false);

    const generar = useCallback(async () => {
        setEsperandoConfirmacion(false);
        const nuevo = await intentar(() => postCobroQr(venta.id));
        if (!nuevo) {
            publicar("pago_cancelado");
            return;
        }
        setCobro(nuevo);
        if (nuevo.url) {
            publicarEnVisor({ tipo: "qr", url: nuevo.url, modo: nuevo.modo });
        }
    }, [intentar, publicar, venta.id]);

    useEffect(() => {
        generar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Mientras esté pendiente, se pregunta si el webhook ya ha creado el pago.
    const pendiente = cobro?.estado === "pendiente";
    const cobroId = cobro?.id;
    useEffect(() => {
        if (!pendiente || !cobroId) return;
        const intervalo = setInterval(async () => {
            try {
                const actual = await getCobroQr(cobroId);
                if (actual.estado === "pendiente") return;
                setCobro((anterior) => anterior ? { ...actual, url: anterior.url } : actual);
            } catch {
                // Un fallo puntual de red: se reintenta en la siguiente vuelta.
            }
        }, INTERVALO_CONSULTA_MS);
        return () => clearInterval(intervalo);
    }, [pendiente, cobroId]);

    useEffect(() => {
        if (!cobro || cobro.estado !== "pagado" || cobro.incidencia || terminado.current) return;
        terminado.current = true;
        publicar("pago_con_qr_hecho", cobro.id);
    }, [cobro, publicar]);

    const cancelar = async () => {
        if (!cobro || cobro.estado !== "pendiente") {
            publicar("pago_cancelado");
            return;
        }
        const resultado = await intentar(() => postCancelarCobroQr(cobro.id));
        if (resultado?.estado === "pendiente") {
            // El cliente llegó a pagar: hay que esperar al aviso de Stripe.
            setEsperandoConfirmacion(true);
            return;
        }
        publicar("pago_cancelado");
    };

    const cerrar = () => {
        // Pagado con incidencia: el pago puede no estar en la venta; se refresca igual.
        if (cobro?.estado === "pagado") publicar("pago_con_qr_hecho", cobro.id);
        else publicar("pago_cancelado");
    };

    return (
        <QModal abierto={true} nombre="pagar_con_qr" titulo="Pago con QR" onCerrar={cancelar}>
            <div className="PagarQrVentaTpv">
                {!cobro && <p>Generando el QR de pago…</p>}

                {cobro?.estado === "pendiente" && cobro.url && (
                    <>
                        <p className="importe">{formatearMoneda(cobro.importe, cobro.divisaId)}</p>
                        <CodigoQr url={cobro.url} />
                        <p>
                            {esperandoConfirmacion
                                ? "El cliente ya ha pagado. Esperando la confirmación de Stripe…"
                                : "El cliente escanea el código con el móvil y paga. Esperando el pago…"}
                        </p>
                        {cobro.modo === "test" && (
                            <QAviso variante="info">Modo test: no se cobra de verdad.</QAviso>
                        )}
                        <div className="botones maestro-botones">
                            <QBoton onClick={cancelar} variante="borde" deshabilitado={esperandoConfirmacion}>
                                Cancelar
                            </QBoton>
                        </div>
                    </>
                )}

                {cobro?.estado === "pagado" && cobro.incidencia && (
                    <>
                        <QAviso variante="advertencia">{textoIncidencia(cobro.incidencia)}</QAviso>
                        <div className="botones maestro-botones">
                            <QBoton onClick={cerrar}>Cerrar</QBoton>
                        </div>
                    </>
                )}

                {cobro && ["cancelado", "caducado"].includes(cobro.estado) && (
                    <>
                        <p>El QR ha caducado y ya no admite pagos.</p>
                        <div className="botones maestro-botones">
                            <QBoton onClick={generar}>Generar otro QR</QBoton>
                            <QBoton onClick={cerrar} variante="borde">Cerrar</QBoton>
                        </div>
                    </>
                )}
            </div>
        </QModal>
    );
};
