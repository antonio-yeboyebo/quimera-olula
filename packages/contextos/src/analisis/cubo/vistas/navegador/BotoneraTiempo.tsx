import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useEffect, useState } from "react";
import { Cubo, PeticionPivot } from "../../diseño.ts";
import {
    alternarAno,
    alternarMes,
    alternarTrimestre,
    anosElegidos,
    mesesElegidos,
    nivelDeTipo,
    trimestresElegidos,
} from "../../dominio.ts";
import { buscarMiembros } from "../../infraestructura.ts";

type BotoneraTiempoProps = {
    cubo: Cubo;
    peticion: PeticionPivot;
    onCambio: (peticion: PeticionPivot) => void;
};

const ANOS_BOTONERA = 5;
const MAX_ANOS_CONSULTA = 100;
const TRIMESTRES = ["T1", "T2", "T3", "T4"];
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const Boton = ({ texto, elegido, onClick }: { texto: string; elegido: boolean; onClick: () => void }) => (
    <QBoton tamaño="pequeño" variante={elegido ? "solido" : "borde"} onClick={onClick}>
        {texto}
    </QBoton>
);

export const BotoneraTiempo = ({ cubo, peticion, onCambio }: BotoneraTiempoProps) => {
    const [anos, setAnos] = useState<number[]>([]);
    const nivelAno = nivelDeTipo(cubo, "ano");
    const hayTrimestre = nivelDeTipo(cubo, "trimestre") !== undefined;
    const hayMes = nivelDeTipo(cubo, "mes") !== undefined;

    const refAno = nivelAno?.ref;

    useEffect(() => {
        if (!refAno) return;
        buscarMiembros(cubo.id, refAno, {
            filtros: {},
            buscar: "",
            todos: true,
            limite: MAX_ANOS_CONSULTA,
            desplazamiento: 0,
            seleccionados: [],
        }).then(({ miembros }) =>
            setAnos(
                miembros
                    .filter((m) => m.codigo !== null)
                    .map((m) => Number(m.codigo))
                    .sort((a, b) => b - a)
                    .slice(0, ANOS_BOTONERA)
                    .reverse()
            )
        );
    }, [cubo.id, refAno]);

    if (!nivelAno && !hayTrimestre && !hayMes) return null;

    const anosActivos = anosElegidos(peticion, cubo);
    const trimestresActivos = trimestresElegidos(peticion, cubo);
    const mesesActivos = mesesElegidos(peticion, cubo);

    return (
        <section className="analisis-botonera">
            <h3>Periodo</h3>
            {anos.length > 0 && (
                <div className="analisis-botonera-fila">
                    {anos.map((ano) => (
                        <Boton
                            key={ano}
                            texto={String(ano)}
                            elegido={anosActivos.includes(ano)}
                            onClick={() => onCambio(alternarAno(peticion, cubo, ano, anos))}
                        />
                    ))}
                </div>
            )}
            {hayTrimestre && (
                <div className="analisis-botonera-fila">
                    {TRIMESTRES.map((trimestre) => (
                        <Boton
                            key={trimestre}
                            texto={trimestre}
                            elegido={trimestresActivos.includes(trimestre)}
                            onClick={() => onCambio(alternarTrimestre(peticion, cubo, trimestre))}
                        />
                    ))}
                </div>
            )}
            {hayMes && (
                <div className="analisis-botonera-fila">
                    {MESES.map((texto, i) => (
                        <Boton
                            key={texto}
                            texto={texto}
                            elegido={mesesActivos.includes(i + 1)}
                            onClick={() => onCambio(alternarMes(peticion, cubo, i + 1, anos))}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};
