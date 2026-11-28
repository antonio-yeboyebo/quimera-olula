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
import { useTTesoreria } from "../../i18n/index.ts";

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
    const t = useTTesoreria();
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
                    <p>{t("cobro_online.generandoElEnlaceDePago")}</p>
                ) : (
                    <>
                        <p>
                            {t("cobro_online.conEsteEnlaceElClientePaga", { descripcion, valor: formatearMoneda(enlace.importe, enlace.divisaId) })}
                        </p>
                        {enlace.modo === "test" && (
                            <QAviso variante="info">
                                {t("cobro_online.modoTestElEnlaceNoHace")}
                            </QAviso>
                        )}
                        <quimera-formulario>
                            <QInput label={t("cobro_online.enlaceDePago")} nombre="url" valor={enlace.url} soloLectura />
                            <QInput
                                label={t("cobro_online.emailDelCliente")}
                                nombre="email"
                                tipo="email"
                                valor={email}
                                onChange={(valor) => setEmail(valor)}
                            />
                        </quimera-formulario>
                        {enlace.enviadoA && (
                            <p className="enviado">{t("cobro_online.enlaceEnviadoAEnviadoa", { enviadoA: enlace.enviadoA })}</p>
                        )}
                        <div className="botones maestro-botones">
                            <QBoton onClick={copiar}>
                                {copiado ? t("cobro_online.enlaceCopiado") : t("cobro_online.copiarEnlace")}
                            </QBoton>
                            <QBoton
                                onClick={enviar}
                                deshabilitado={!emailValido(email) || enviando}
                                variante="borde"
                            >
                                {enviando ? t("cobro_online.enviando") : t("cobro_online.enviarPorEmail")}
                            </QBoton>
                            <QBoton onClick={onCerrar} variante="borde">
                                {t("cobro_online.cerrar")}
                            </QBoton>
                        </div>
                    </>
                )}
            </div>
        </QModal>
    );
};
