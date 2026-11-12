import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { getSemanasDelMes } from "@olula/componentes/calendario/helpers.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { Tarea } from "../../comun/diseño.ts";
import { fechaIso, tareaAtrasada } from "../../comun/dominio.ts";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { SelectorAgente } from "../../comun/componentes/SelectorAgente.tsx";
import { TarjetaTarea } from "../../comun/componentes/TarjetaTarea.tsx";
import { getTareasCompletadas, getTareasRango } from "../../tareas/infraestructura.ts";
import { VistaAgenda } from "../diseño.ts";
import {
    agruparPorDia,
    bloquesProximas,
    desplazar,
    diasDeLaSemana,
    rangoProximas,
    rangoVista,
    textoFecha,
    tituloVista,
} from "../dominio.ts";
import "./Agenda.css";

const pestañas: [VistaAgenda, string][] = [
    ["dia", "Día"],
    ["semana", "Semana"],
    ["mes", "Mes"],
];

const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"];

const ListaPorDia = ({ tareas, vacio }: { tareas: Tarea[]; vacio: string }) => {
    if (tareas.length === 0) return <p className="vacio">{vacio}</p>;
    return (
        <>
            {agruparPorDia(tareas).map(([fecha, delDia]) => (
                <section key={fecha} className="dia">
                    <h3>{textoFecha(fecha)}</h3>
                    {delDia.map((tarea) => (
                        <TarjetaTarea key={tarea.id} tarea={tarea} />
                    ))}
                </section>
            ))}
        </>
    );
};

const diaCorto = new Intl.DateTimeFormat("es-ES", { weekday: "short" });

const TiraSemana = ({ referencia, onElegirDia }: { referencia: Date; onElegirDia: (dia: Date) => void }) => {
    const hoy = fechaIso(new Date());
    const elegido = fechaIso(referencia);
    return (
        <div className="tira-semana">
            {diasDeLaSemana(referencia).map((dia) => {
                const iso = fechaIso(dia);
                return (
                    <button
                        key={iso}
                        type="button"
                        aria-pressed={iso === elegido}
                        className={iso === hoy ? "hoy" : undefined}
                        onClick={() => onElegirDia(dia)}
                    >
                        <span className="nombre">{diaCorto.format(dia)}</span>
                        <span className="numero">{dia.getDate()}</span>
                    </button>
                );
            })}
        </div>
    );
};

const RejillaMes = ({
    referencia,
    tareas,
    onElegirDia,
}: {
    referencia: Date;
    tareas: Tarea[];
    onElegirDia: (dia: Date) => void;
}) => {
    const hoy = fechaIso(new Date());
    return (
        <div className="rejilla-mes">
            {DIAS_SEMANA.map((dia) => (
                <span key={dia} className="cabecera">
                    {dia}
                </span>
            ))}
            {getSemanasDelMes(referencia, "lunes")
                .flat()
                .map((dia) => {
                    const iso = fechaIso(dia);
                    const delDia = tareas.filter((t) => t.fecha === iso);
                    const fueraDeMes = dia.getMonth() !== referencia.getMonth();
                    const conAtrasadas = delDia.some((t) => tareaAtrasada(t));
                    return (
                        <button
                            key={iso}
                            type="button"
                            className={["dia", fueraDeMes && "fuera", iso === hoy && "hoy"].filter(Boolean).join(" ")}
                            onClick={() => onElegirDia(dia)}
                        >
                            <span>{dia.getDate()}</span>
                            {delDia.length > 0 && (
                                <span className={conAtrasadas ? "contador atrasadas" : "contador"}>{delDia.length}</span>
                            )}
                        </button>
                    );
                })}
        </div>
    );
};

export const Agenda = () => {
    const { intentar } = useContext(ContextoError);
    const { agenteSeguido, cargando } = useAgenteSeguido();
    const [vista, setVista] = useState<VistaAgenda>("dia");
    const [referencia, setReferencia] = useState(() => new Date());
    const [tareas, setTareas] = useState<Tarea[]>([]);
    const [proximas, setProximas] = useState<Tarea[]>([]);
    const [historial, setHistorial] = useState<Tarea[] | null>(null);

    const { desde, hasta } = rangoVista(vista, referencia);

    useEffect(() => {
        if (cargando) return;
        const cargar = async () =>
            setTareas(await intentar(() => getTareasRango({ desde, hasta, agente: agenteSeguido })));
        cargar().catch(() => undefined);
    }, [intentar, cargando, agenteSeguido, desde, hasta]);

    useEffect(() => {
        if (cargando) return;
        const cargar = async () =>
            setProximas(await intentar(() => getTareasRango({ ...rangoProximas(new Date()), agente: agenteSeguido })));
        cargar().catch(() => undefined);
        setHistorial(null);
    }, [intentar, cargando, agenteSeguido]);

    const verHistorial = async () => setHistorial(await intentar(() => getTareasCompletadas(agenteSeguido)));

    const bloques = bloquesProximas(proximas, new Date());
    const viendoHoy = vista === "dia" && fechaIso(referencia) === fechaIso(new Date());

    return (
        <LayoutSmartsales>
            <div className="Agenda">
                <h1>Agenda</h1>

                <SelectorAgente />

                <div className="pestañas" role="tablist">
                    {pestañas.map(([valor, texto]) => (
                        <button
                            key={valor}
                            type="button"
                            role="tab"
                            aria-selected={vista === valor}
                            onClick={() => setVista(valor)}
                        >
                            {texto}
                        </button>
                    ))}
                </div>

                <div className="navegacion">
                    <button type="button" aria-label="Anterior" onClick={() => setReferencia(desplazar(vista, referencia, -1))}>
                        <QIcono nombre="izquierda" />
                    </button>
                    <span className="titulo">{tituloVista(vista, referencia)}</span>
                    <button type="button" aria-label="Siguiente" onClick={() => setReferencia(desplazar(vista, referencia, 1))}>
                        <QIcono nombre="derecha" />
                    </button>
                    <QBoton variante="texto" tamaño="pequeño" onClick={() => setReferencia(new Date())}>
                        Hoy
                    </QBoton>
                </div>

                {vista !== "mes" && (
                    <TiraSemana
                        referencia={referencia}
                        onElegirDia={(dia) => {
                            setReferencia(dia);
                            setVista("dia");
                        }}
                    />
                )}

                {vista === "mes" ? (
                    <RejillaMes
                        referencia={referencia}
                        tareas={tareas}
                        onElegirDia={(dia) => {
                            setReferencia(dia);
                            setVista("dia");
                        }}
                    />
                ) : (
                    <div className="tarjeta tareas">
                        <ListaPorDia tareas={tareas} vacio="No hay tareas en este periodo" />
                    </div>
                )}

                <QBoton enlace={rutasSmartsales.nuevaTarea} ancho>
                    + Añadir a la agenda
                </QBoton>

                <section className="tarjeta tareas bloques">
                    {!viendoHoy && (
                        <>
                            <h2>Hoy</h2>
                            {bloques.hoy.length === 0 && <p className="vacio">Sin tareas</p>}
                            {bloques.hoy.map((tarea) => (
                                <TarjetaTarea key={tarea.id} tarea={tarea} />
                            ))}
                        </>
                    )}
                    <h2>Mañana</h2>
                    {bloques.mañana.length === 0 && <p className="vacio">Sin tareas</p>}
                    {bloques.mañana.map((tarea) => (
                        <TarjetaTarea key={tarea.id} tarea={tarea} />
                    ))}
                    <h2>Próximamente</h2>
                    <ListaPorDia tareas={bloques.proximamente} vacio="Sin tareas en los próximos 30 días" />
                </section>

                <section className="tarjeta tareas historial">
                    <h2>Historial de tareas completadas</h2>
                    {historial === null ? (
                        <QBoton variante="borde" tamaño="pequeño" onClick={() => verHistorial().catch(() => undefined)}>
                            Ver historial
                        </QBoton>
                    ) : (
                        <ListaPorDia tareas={historial} vacio="No hay tareas completadas" />
                    )}
                </section>
            </div>
        </LayoutSmartsales>
    );
};
