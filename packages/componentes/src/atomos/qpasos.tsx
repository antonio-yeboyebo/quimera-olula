import "./qpasos.css";
import { tComponentes } from "../i18n/textos.ts";

interface QPasosProps {
    total: number;
    actual: number; // 0-indexed
}

export const QPasos = ({ total, actual }: QPasosProps) => {
    if (total <= 1) return null;

    return (
        <ol className="q-pasos" aria-label={tComponentes("ui.atomos.pasoValorDeTotal", { valor: actual + 1, total })}>
            {Array.from({ length: total }, (_, i) => {
                const estado =
                    i < actual ? "completado" : i === actual ? "activo" : "pendiente";
                return (
                    <li key={i} className={`q-pasos__paso ${estado}`} aria-current={i === actual ? "step" : undefined}>
                        <span className="q-pasos__circulo">{i < actual ? "✓" : i + 1}</span>
                    </li>
                );
            })}
        </ol>
    );
};
