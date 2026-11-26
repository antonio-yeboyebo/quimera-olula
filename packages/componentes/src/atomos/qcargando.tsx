import { useTComponentes } from "../i18n/textos.ts";
import "./qcargando.css";

type QCargandoProps = {
    visible: boolean;
    mensaje?: string;
};

export const QCargando = ({ visible, mensaje }: QCargandoProps) => {
    const t = useTComponentes();
    if (!visible) return null;

    return (
        <quimera-cargando>
            <div role="status">
                <div />
                <p>{mensaje ?? t("comun.cargando")}</p>
            </div>
        </quimera-cargando>
    );
};
