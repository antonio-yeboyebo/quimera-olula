import { useState } from "react";
import { ComponenteMaquina, EstadoComponente, EstadoFase, FaseMaquina } from "../../../diseño.ts";
import { esHoja } from "../../../dominio.ts";
import "./ArbolMaquina.css";

interface Props {
    componentes: ComponenteMaquina[];
}

const badgeClase = (estado: EstadoComponente | EstadoFase, cuadrado = false): string => {
    const extra = cuadrado ? " ArbolMaquina-badge--cuadrado" : "";
    if (estado === "Pendiente") return `ArbolMaquina-badge ArbolMaquina-badge--pendiente${extra}`;
    if (estado === "En Curso" || estado === "Pedido") return `ArbolMaquina-badge ArbolMaquina-badge--en-curso${extra}`;
    return `ArbolMaquina-badge ArbolMaquina-badge--listo${extra}`;
};

interface NodoProps {
    componente: ComponenteMaquina;
    expandidos: Set<string>;
    onToggle: (id: string) => void;
    nivel: number;
}

const CeldaProveedor = ({ fase }: { fase: FaseMaquina }) => {
    if (fase.estado === "Pedido" && fase.numDoc) {
        return (
            <td>
                {fase.proveedor}{" "}
                <a href="#">Ped. {fase.numDoc}</a>
            </td>
        );
    }
    if (fase.estado === "Recibido" && fase.numDoc) {
        return (
            <td>
                {fase.proveedor}{" "}
                <a href="#">Alb. {fase.numDoc}</a>
            </td>
        );
    }
    return <td>{fase.proveedor}</td>;
};

const CeldaEstadoFase = ({ fase }: { fase: FaseMaquina }) => (
    <td>
        <span className={badgeClase(fase.estado)}>{fase.estado}</span>
        {fase.estado === "Pendiente" && (
            <button className="ArbolMaquina-btn-pedir" type="button">
                Pedir
            </button>
        )}
    </td>
);

const FilaFases = ({ fases }: { fases: FaseMaquina[] }) => {
    if (fases.length === 0) return null;
    return (
        <table className="ArbolMaquina-fases">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Observaciones</th>
                    <th>Proveedor</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                {fases.map((f) => (
                    <tr key={f.id}>
                        <td>{f.codigo}</td>
                        <td>{f.observaciones}</td>
                        <CeldaProveedor fase={f} />
                        <CeldaEstadoFase fase={f} />
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const NodoComponente = ({ componente, expandidos, onToggle, nivel }: NodoProps) => {
    const estaExpandido = expandidos.has(componente.id);
    const esNodoHoja = esHoja(componente);
    const sangria = nivel * 20;

    return (
        <div className="ArbolMaquina-nodo">
            <div className="ArbolMaquina-fila" style={{ paddingLeft: `${8 + sangria}px` }}>
                <div className="ArbolMaquina-descripcion">
                    {esNodoHoja ? (
                        <span className="ArbolMaquina-icono-espacio" />
                    ) : (
                        <button
                            className="ArbolMaquina-toggle"
                            onClick={() => onToggle(componente.id)}
                            type="button"
                        >
                            {estaExpandido ? "▼" : "▶"}
                        </button>
                    )}
                    <span>{componente.referencia}</span>
                    <span style={{ color: "#888", fontSize: "0.8em" }}>{componente.descripcion}</span>
                </div>
                <div>{componente.cantidad}</div>
                <div>
                    <span className={badgeClase(componente.estado, true)}>{componente.estado}</span>
                </div>
            </div>

            {esNodoHoja && (
                <div className="ArbolMaquina-hoja-detalle" style={{ paddingLeft: `${32 + sangria}px` }}>
                    <div className="ArbolMaquina-ruta">
                        Ruta:{" "}
                        <button className="ArbolMaquina-btn-ruta" type="button">
                            {componente.ruta}
                        </button>
                    </div>
                    <FilaFases fases={componente.fases} />
                </div>
            )}

            {!esNodoHoja && estaExpandido && (
                <div className="ArbolMaquina-children">
                    {componente.componentes.map((hijo) => (
                        <NodoComponente
                            key={hijo.id}
                            componente={hijo}
                            expandidos={expandidos}
                            onToggle={onToggle}
                            nivel={nivel + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const ArbolMaquina = ({ componentes }: Props) => {
    const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

    const toggleExpandido = (id: string) => {
        setExpandidos((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <div className="ArbolMaquina">
            <div className="ArbolMaquina-cabecera">
                <div>Referencia / Descripción</div>
                <div>Cantidad</div>
                <div>Estado</div>
            </div>
            {componentes.map((c) => (
                <NodoComponente
                    key={c.id}
                    componente={c}
                    expandidos={expandidos}
                    onToggle={toggleExpandido}
                    nivel={0}
                />
            ))}
        </div>
    );
};
