import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { useReconocimientoVoz } from "@olula/lib/voz/useReconocimientoVoz.ts";
import { useEffect, useRef } from "react";
import "./NotaDictada.css";

type NotaDictadaProps = {
    valor: string;
    onChange: (valor: string) => void;
    maximo?: number;
    label?: string;
};

const AVISO_LIMITE = 0.9;

export const NotaDictada = ({ valor, onChange, maximo = 1000, label = "Nota" }: NotaDictadaProps) => {
    const { soportado, escuchando, resultado, interino, error, iniciar, detener } = useReconocimientoVoz();
    const actual = useRef({ valor, onChange, maximo });
    actual.current = { valor, onChange, maximo };

    useEffect(() => {
        if (!resultado) return;
        const { valor, onChange, maximo } = actual.current;
        onChange([valor, resultado].filter(Boolean).join(valor.endsWith(" ") ? "" : " ").slice(0, maximo));
    }, [resultado]);

    const cercaDelLimite = valor.length >= maximo * AVISO_LIMITE;

    return (
        <div className="NotaDictada">
            <QTextArea label={label} nombre="nota" valor={valor} rows={4} onChange={(texto) => onChange(texto.slice(0, maximo))} />
            <div className="pie">
                {soportado && (
                    <QBoton variante="borde" tamaño="pequeño" onClick={escuchando ? detener : iniciar}>
                        {escuchando ? "Detener dictado" : "🎤 Dictar nota"}
                    </QBoton>
                )}
                <span className={cercaDelLimite ? "contador limite" : "contador"}>
                    {valor.length} / {maximo}
                </span>
            </div>
            {interino && <p className="interino">{interino}…</p>}
            {error && <p className="error">{error}</p>}
        </div>
    );
};
