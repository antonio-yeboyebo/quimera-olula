import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { useContext, useEffect, useState } from "react";
import { EnlacePago, GenerarEnlacePago } from "../diseño.ts";
import { emailValido } from "../dominio.ts";
import "./EnlacePagoTarjeta.css";

/**
 * Enlace permanente para que el cliente pague con tarjeta (Stripe). Al abrirse
 * lo crea, o recupera el que ya tenga el documento; se puede copiar o enviar
 * por email. El cobro se apunta solo cuando el cliente paga.
 */
export const EnlacePagoTarjeta = ({
    titulo,
    descripcion,
    generar,
    onCerrar,
}: {
    titulo: string;
    /** Qué se cobra, para el texto: "el recibo R1", "la factura F1". */
    descripcion: string;
    generar: GenerarEnlacePago;
    onCerrar: () => void;
}) => {
    const { intentar } = useContext(ContextoError);
    const [enlace, setEnlace] = useState<EnlacePago | null>(null);
    const [copiado, setCopiado] = useState(false);
    const [email, setEmail] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        intentar(async () => setEnlace(await generar()));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const copiar = async () => {
        if (!enlace) return;
        try {
            await navigator.clipboard.writeText(enlace.url);
            setCopiado(true);
        } catch {
            setCopiado(false);
        }
    };

    const enviar = async () => {
        setEnviando(true);
        try {
            const enviado = await intentar(() => generar(email.trim()));
            if (enviado) setEnlace(enviado);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <QModal abierto={true} nombre="enlace_pago_tarjeta" titulo={titulo} onCerrar={onCerrar}>
            <div className="EnlacePagoTarjeta">
                {!enlace ? (
                    <p>Generando el enlace de pago…</p>
                ) : (
                    <>
                        <p>
                            Con este enlace el cliente paga {descripcion} con tarjeta
                            ({formatearMoneda(enlace.importe, enlace.divisaId)}). No caduca:
                            al abrirlo cobra lo que quede pendiente en ese momento, y el
                            pago se apunta solo.
                        </p>
                        {enlace.modo === "test" && (
                            <QAviso variante="info">
                                Modo test: el enlace no hace cobros reales.
                            </QAviso>
                        )}
                        <quimera-formulario>
                            <QInput label="Enlace de pago" nombre="url" valor={enlace.url} soloLectura />
                            <QInput
                                label="Email del cliente"
                                nombre="email"
                                tipo="email"
                                valor={email}
                                onChange={(valor) => setEmail(valor)}
                            />
                        </quimera-formulario>
                        {enlace.enviadoA && (
                            <p className="enviado">Enlace enviado a {enlace.enviadoA}.</p>
                        )}
                        <div className="botones maestro-botones">
                            <QBoton onClick={copiar}>
                                {copiado ? "Enlace copiado" : "Copiar enlace"}
                            </QBoton>
                            <QBoton
                                onClick={enviar}
                                deshabilitado={!emailValido(email) || enviando}
                                variante="borde"
                            >
                                {enviando ? "Enviando…" : "Enviar por email"}
                            </QBoton>
                            <QBoton onClick={onCerrar} variante="borde">
                                Cerrar
                            </QBoton>
                        </div>
                    </>
                )}
            </div>
        </QModal>
    );
};
