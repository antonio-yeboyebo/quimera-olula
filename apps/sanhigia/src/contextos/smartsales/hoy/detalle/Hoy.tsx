import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { ComunicacionesResumen } from "../../ComunicacionesResumen.tsx";
import { Tarea } from "../../comun/diseño.ts";
import {
    fechaIso,
    porcentajeConseguido,
    porcentajeTiempoTranscurrido,
    rangoTrimestre,
    textoTrimestre,
    trimestreDe,
} from "../../comun/dominio.ts";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { IndicadorProgreso } from "../../comun/componentes/IndicadorProgreso.tsx";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { SelectorAgente } from "../../comun/componentes/SelectorAgente.tsx";
import { TarjetaTarea } from "../../comun/componentes/TarjetaTarea.tsx";
import { getTareasRango } from "../../tareas/infraestructura.ts";
import { Avisos, ProgresoComercial, TratoAbierto } from "../diseño.ts";
import { contarAtrasadas, saludo, separarTareasHoy } from "../dominio.ts";
import { getAvisos, getProgresoComercial, getTratosAbiertos } from "../infraestructura.ts";
import "./Hoy.css";
import { ListaKpi } from "../../comun/componentes/ListaKpi.tsx";

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const AvisoEnlace = ({ texto, total, ruta }: { texto: string; total: number; ruta: string }) => (
    <Link to={ruta} className="aviso">
        <span>{texto}</span>
        <strong>{total}</strong>
    </Link>
);

const MAX_ANTERIORES = 3;

export const Hoy = () => {
    const { intentar } = useContext(ContextoError);
    const { agentes, agentePropio, agenteSeguido, cargando } = useAgenteSeguido();
    const [avisos, setAvisos] = useState<Avisos | null>(null);
    const [progreso, setProgreso] = useState<ProgresoComercial | null>(null);
    const [tareas, setTareas] = useState<Tarea[]>([]);
    const [tratos, setTratos] = useState<TratoAbierto[]>([]);

    const trimestre = trimestreDe(new Date());
    const hoy = fechaIso(new Date());

    useEffect(() => {
        const cargar = async () => setAvisos(await intentar(getAvisos));
        cargar().catch(() => undefined);
    }, [intentar]);

    useEffect(() => {
        if (cargando) return;
        const cargar = async () => {
            const [nuevoProgreso, nuevasTareas, nuevosTratos] = await intentar(() =>
                Promise.all([
                    getProgresoComercial(agenteSeguido, { año: trimestre.año, numero: trimestre.numero }),
                    getTareasRango({ desde: hoy, hasta: hoy, agente: agenteSeguido, conAtrasadas: true }),
                    getTratosAbiertos(agenteSeguido),
                ])
            );
            setProgreso(nuevoProgreso);
            setTareas(nuevasTareas);
            setTratos(nuevosTratos);
        };
        cargar().catch(() => undefined);
    }, [intentar, cargando, agenteSeguido, hoy, trimestre.año, trimestre.numero]);

    const nombre = agentes.find((agente) => agente.codigo === agentePropio)?.nombre;
    const { deHoy, anteriores } = separarTareasHoy(tareas, hoy);
    const atrasadas = contarAtrasadas(tareas);
    const tiempoTrimestre = porcentajeTiempoTranscurrido(rangoTrimestre(trimestre));

    return (
        <LayoutSmartsales>
            <div className="Hoy">
                <h1>
                    {saludo()}
                    {nombre ? `, ${nombre}` : ""}
                </h1>

                {avisos && (
                    <nav className="avisos" aria-label="Avisos">
                        <AvisoEnlace texto="Contactos de cursos" total={avisos.contactosCursos} ruta={rutasSmartsales.contactosCursos} />
                        <AvisoEnlace
                            texto="Contactos más activos en los últimos meses"
                            total={avisos.contactosActivos}
                            ruta={rutasSmartsales.contactosActivos}
                        />
                        <AvisoEnlace
                            texto="Pedidos de clientes de tu zona hechos por otros agentes"
                            total={avisos.pedidosOtrosAgentes}
                            ruta={rutasSmartsales.pedidosOtrosAgentes}
                        />
                    </nav>
                )}

                {atrasadas > 0 && (
                    <Link to={rutasSmartsales.tareasAtrasadas} className="aviso-atrasadas">
                        <QIcono nombre="relojarena" />
                        <span>
                            Tienes <strong>{atrasadas}</strong> {atrasadas === 1 ? "tarea atrasada" : "tareas atrasadas"}
                        </span>
                    </Link>
                )}

                <SelectorAgente />

                <section className="tarjeta progreso">
                    <header>
                        <h2>Mi progreso comercial</h2>
                        <span className="periodo">{textoTrimestre(trimestre)}</span>
                    </header>
                    {progreso && (
                        <div className="ventas">
                            <div>
                                <Link to={rutasSmartsales.rendimiento} className="cifra">
                                    {euros.format(progreso.ventas)}
                                </Link>
                                <span className="secundario">de {euros.format(progreso.objetivo)}</span>
                                <span className={progreso.incremento < 0 ? "incremento negativo" : "incremento"}>
                                    {progreso.incremento > 0 ? "+" : ""}
                                    {progreso.incremento.toFixed(1)} % vs {textoTrimestre({ ...trimestre, año: trimestre.año - 1 })}
                                </span>
                            </div>
                            <IndicadorProgreso
                                forma="circulo"
                                conseguido={porcentajeConseguido(progreso.ventas, progreso.objetivo)}
                                tiempo={tiempoTrimestre}
                            />
                        </div>
                    )}
                </section>

                <section className="tarjeta">
                    <header className="cabecera-tarjeta">
                        <h2>Clientes nuevos por familia</h2>
                        <Link to={rutasSmartsales.objetivos}>Ver todas</Link>
                    </header>
                    {progreso && <ListaKpi bloque={progreso.nuevosClientes} textoVacio="Sin objetivos de clientes nuevos en este periodo" />}
                </section>

                <section className="tarjeta">
                    <h2>Unidades por producto</h2>
                    {progreso && <ListaKpi bloque={progreso.unidades} textoVacio="Sin objetivos de unidades en este periodo" />}
                </section>

                <section className="tarjeta tareas">
                    <h2>Tareas de hoy</h2>
                    {deHoy.length === 0 && <p className="vacio">No hay tareas para hoy</p>}
                    {deHoy.map((tarea) => (
                        <TarjetaTarea key={tarea.id} tarea={tarea} />
                    ))}
                    {anteriores.length > 0 && <h3>Atrasadas de días anteriores</h3>}
                    {anteriores.slice(0, MAX_ANTERIORES).map((tarea) => (
                        <TarjetaTarea key={tarea.id} tarea={tarea} conFecha />
                    ))}
                    {anteriores.length > MAX_ANTERIORES && (
                        <Link to={rutasSmartsales.tareasAtrasadas} className="ver-todas">
                            Ver las {anteriores.length} atrasadas
                        </Link>
                    )}
                </section>

                <section className="tarjeta">
                    <header className="cabecera-tarjeta">
                        <h2>Tratos abiertos</h2>
                        <Link to={rutasSmartsales.tratos}>Ver todos</Link>
                    </header>
                    {tratos.length === 0 && <p className="vacio">No hay tratos abiertos</p>}
                    <ul className="tratos">
                        {tratos.map((trato) => (
                            <li key={trato.id}>
                                <Link to={rutasSmartsales.trato(trato.id)}>
                                    <strong>{trato.titulo}</strong>
                                    <span className="secundario">{trato.cliente}</span>
                                    <span className="valor">{euros.format(trato.valor)}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="tarjeta">
                    <h2>Comunicaciones</h2>
                    <ComunicacionesResumen />
                </section>
            </div>
        </LayoutSmartsales>
    );
};
