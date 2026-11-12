import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { useState } from "react";
import { Nivel } from "../../diseño.ts";

type ElegirNivelesProps = {
    titulo: string;
    niveles: Nivel[];
    elegidos: string[];
    enOtroEje: string[];
    nombreOtroEje: string;
    onAceptar: (refs: string[]) => void;
    onCerrar: () => void;
};

const BotonIcono = ({ icono, texto, deshabilitado, onClick }: { icono: string; texto: string; deshabilitado?: boolean; onClick: () => void }) => (
    <button type="button" title={texto} aria-label={texto} disabled={deshabilitado} onClick={onClick}>
        <QIcono nombre={icono} tamaño="xs" />
    </button>
);

export const ElegirNiveles = ({ titulo, niveles, elegidos, enOtroEje, nombreOtroEje, onAceptar, onCerrar }: ElegirNivelesProps) => {
    const [refs, setRefs] = useState(elegidos);
    const nivel = (ref: string) => niveles.find((n) => n.ref === ref);
    const disponibles = niveles.filter((n) => !refs.includes(n.ref));

    const mover = (i: number, paso: -1 | 1) => {
        const nuevos = [...refs];
        [nuevos[i], nuevos[i + paso]] = [nuevos[i + paso], nuevos[i]];
        setRefs(nuevos);
    };

    return (
        <QModal nombre="elegir-niveles" titulo={titulo} abierto onCerrar={onCerrar}>
            <div className="analisis-elegir-niveles">
                <section>
                    <h3>Elegidos</h3>
                    {refs.length === 0 && <p className="analisis-zona-vacia">Ninguno.</p>}
                    <ol>
                        {refs.map((ref, i) => (
                            <li key={ref}>
                                <span>{nivel(ref)?.descripcion ?? ref}</span>
                                <BotonIcono icono="arriba" texto="Subir" deshabilitado={i === 0} onClick={() => mover(i, -1)} />
                                <BotonIcono
                                    icono="abajo"
                                    texto="Bajar"
                                    deshabilitado={i === refs.length - 1}
                                    onClick={() => mover(i, 1)}
                                />
                                <BotonIcono icono="cerrar" texto="Quitar" onClick={() => setRefs(refs.filter((r) => r !== ref))} />
                            </li>
                        ))}
                    </ol>
                </section>
                <section>
                    <h3>Disponibles</h3>
                    <div className="analisis-elegir-disponibles">
                        {disponibles.map((n) => (
                            <button key={n.ref} type="button" onClick={() => setRefs([...refs, n.ref])}>
                                <QIcono nombre="crear" tamaño="xs" />
                                {n.descripcion}
                                {enOtroEje.includes(n.ref) && <small>en {nombreOtroEje}</small>}
                            </button>
                        ))}
                    </div>
                </section>
                <div className="analisis-filtro-botones">
                    <QBoton variante="texto" onClick={onCerrar}>
                        Cancelar
                    </QBoton>
                    <QBoton onClick={() => onAceptar(refs)}>Aceptar</QBoton>
                </div>
            </div>
        </QModal>
    );
};
