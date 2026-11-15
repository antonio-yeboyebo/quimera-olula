import { QBoton } from "@olula/componentes/index.js";
import { useFocus } from "@olula/lib/useFocus.js";
import { ReactNode, RefObject, useState } from "react";
import "./SelectorPuestoTpv.css";

export type PropsSelectorPuesto<T> = {
    valor: string;
    soloLectura?: boolean;
    ref?: RefObject<HTMLSelectElement | null>;
    onElegir: (elegido: T | null) => void;
};

/**
 * Dato del puesto TPV (punto de venta, agente…) que se muestra en solo lectura y se cambia
 * con confirmación: «Cambiar» abre el selector, y el cambio solo se aplica al confirmarlo.
 * `Selector` pinta el QSelect concreto con las props que recibe.
 */
export const SelectorPuestoTpv = <T extends { id: string }>({
    actual,
    Selector,
    onConfirmar,
}: {
    actual: T | null;
    Selector: (props: PropsSelectorPuesto<T>) => ReactNode;
    onConfirmar: (elegido: T) => void;
}) => {
    const [editando, setEditando] = useState(false);

    return (
        <div className="tpv-selector-puesto">
            {editando ? (
                <EdicionPuesto
                    actual={actual}
                    Selector={Selector}
                    cancelar={() => setEditando(false)}
                    confirmar={(elegido) => {
                        setEditando(false);
                        if (elegido.id !== actual?.id) onConfirmar(elegido);
                    }}
                />
            ) : (
                <>
                    <Selector valor={actual?.id ?? ""} soloLectura onElegir={() => {}} />
                    <div className="tpv-selector-puesto-botones">
                        <QBoton
                            texto="Cambiar"
                            variante="borde"
                            tamaño="pequeño"
                            onClick={() => setEditando(true)}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

const EdicionPuesto = <T extends { id: string }>({
    actual,
    Selector,
    cancelar,
    confirmar,
}: {
    actual: T | null;
    Selector: (props: PropsSelectorPuesto<T>) => ReactNode;
    cancelar: () => void;
    confirmar: (elegido: T) => void;
}) => {
    const [elegido, setElegido] = useState<T | null>(actual);
    const focus = useFocus();

    return (
        <>
            <Selector valor={elegido?.id ?? ""} ref={focus} onElegir={setElegido} />
            <div className="tpv-selector-puesto-botones">
                <QBoton texto="Cancelar" variante="texto" tamaño="pequeño" onClick={cancelar} />
                <QBoton
                    texto="Cambiar"
                    tamaño="pequeño"
                    deshabilitado={!elegido}
                    onClick={() => elegido && confirmar(elegido)}
                />
            </div>
        </>
    );
};
