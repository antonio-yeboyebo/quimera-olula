import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { useState } from "react";
import { Cubo } from "../../diseño.ts";
import { ejerciciosDesdeTexto } from "../../dominio.ts";

type RecargarCuboProps = {
    cubo: Cubo;
    avisoAutomatico: boolean;
    onAceptar: (ejercicios: string[]) => void;
    onCerrar: () => void;
};

export const RecargarCubo = ({ cubo, avisoAutomatico, onAceptar, onCerrar }: RecargarCuboProps) => {
    const [texto, setTexto] = useState(String(new Date().getFullYear()));
    const ejercicios = ejerciciosDesdeTexto(texto);

    return (
        <QModal nombre="recargar-cubo" titulo={`Recargar ${cubo.descripcion}`} abierto onCerrar={onCerrar}>
            <div className="analisis-recarga">
                <QInput
                    label="Ejercicios"
                    nombre="ejercicios"
                    valor={texto}
                    onChange={setTexto}
                    placeholder="2025, 2026"
                    autoFocus
                />
                <p className="analisis-carga">
                    {avisoAutomatico
                        ? "La recarga se hace en segundo plano. Te avisamos al terminar."
                        : "La recarga se hace en segundo plano. Cuando termine, se verá en la fecha de la última carga."}
                </p>
                <div className="analisis-filtro-botones">
                    <QBoton variante="texto" onClick={onCerrar}>
                        Cancelar
                    </QBoton>
                    <QBoton deshabilitado={ejercicios.length === 0} onClick={() => onAceptar(ejercicios)}>
                        Recargar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
