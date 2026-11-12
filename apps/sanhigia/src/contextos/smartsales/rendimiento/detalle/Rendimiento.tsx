import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { Periodo } from "../../comun/diseño.ts";
import { periodoTrimestreActual, porcentajeConseguido, porcentajeTiempoTranscurrido, rangoPeriodo } from "../../comun/dominio.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { IndicadorProgreso } from "../../comun/componentes/IndicadorProgreso.tsx";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { SelectorAgente } from "../../comun/componentes/SelectorAgente.tsx";
import { SelectorPeriodo } from "../../comun/componentes/SelectorPeriodo.tsx";
import { MesHistorico, VentasFamilia, VentasPeriodo } from "../diseño.ts";
import { añoDelPeriodo, periodoCompleto, textoVariacion, variacion } from "../dominio.ts";
import { getHistoricoVentas, getVentasFamilia, getVentasPeriodo } from "../infraestructura.ts";
import { GraficoMensual } from "./GraficoMensual.tsx";
import "./Rendimiento.css";

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const Variacion = ({ actual, anterior }: { actual: number; anterior: number }) => {
    const valor = variacion(actual, anterior);
    return <span className={valor !== null && valor < 0 ? "variacion negativa" : "variacion"}>{textoVariacion(valor)}</span>;
};

export const Rendimiento = () => {
    const { intentar } = useContext(ContextoError);
    const { agenteSeguido, cargando } = useAgenteSeguido();
    const [periodo, setPeriodo] = useState<Periodo>(periodoTrimestreActual());
    const [ventas, setVentas] = useState<VentasPeriodo | null>(null);
    const [familias, setFamilias] = useState<VentasFamilia[] | null>(null);
    const [historico, setHistorico] = useState<MesHistorico[] | null>(null);

    const completo = periodoCompleto(periodo);
    const año = añoDelPeriodo(periodo);

    useEffect(() => {
        if (cargando || !completo) return;
        setVentas(null);
        setFamilias(null);
        const cargar = async () => {
            const [nuevasVentas, nuevasFamilias] = await intentar(() =>
                Promise.all([getVentasPeriodo(agenteSeguido, periodo), getVentasFamilia(agenteSeguido, periodo)])
            );
            setVentas(nuevasVentas);
            setFamilias(nuevasFamilias);
        };
        cargar().catch(() => undefined);
    }, [intentar, cargando, completo, agenteSeguido, periodo]);

    useEffect(() => {
        if (cargando) return;
        setHistorico(null);
        const cargar = async () => setHistorico(await intentar(() => getHistoricoVentas(agenteSeguido, año)));
        cargar().catch(() => undefined);
    }, [intentar, cargando, agenteSeguido, año]);

    const rango = rangoPeriodo(periodo);
    const tiempo = rango && completo ? porcentajeTiempoTranscurrido(rango) : 0;

    return (
        <LayoutSmartsales>
            <div className="Rendimiento">
                <header>
                    <h1>Rendimiento</h1>
                </header>

                <SelectorAgente />
                <SelectorPeriodo periodo={periodo} onChange={setPeriodo} />

                <section className="tarjeta ventas-periodo">
                    <h2>Ventas del periodo</h2>
                    {!completo && <p className="vacio">Elige un periodo</p>}
                    {completo && !ventas && <p className="vacio">Cargando…</p>}
                    {completo && ventas && (
                        <>
                            <div className="resumen">
                                <div className="cifras">
                                    <span className="secundario">Ventas realizadas</span>
                                    <span className="cifra">{euros.format(ventas.ventas)}</span>
                                </div>
                                <div className="cifras">
                                    <span className="secundario">Objetivo</span>
                                    <span className="cifra">{euros.format(ventas.objetivo)}</span>
                                </div>
                            </div>
                            <div className="progreso">
                                <IndicadorProgreso conseguido={porcentajeConseguido(ventas.ventas, ventas.objetivo)} tiempo={tiempo} />
                                <strong className="porcentaje">
                                    {Math.round(porcentajeConseguido(ventas.ventas, ventas.objetivo) ?? 0)} %
                                </strong>
                            </div>
                            <span className="secundario">
                                <Variacion actual={ventas.ventas} anterior={ventas.ventasAñoAnterior} /> vs año anterior (
                                {euros.format(ventas.ventasAñoAnterior)})
                            </span>
                        </>
                    )}
                </section>

                <section className="tarjeta">
                    <h2>Evolución de ventas {año}</h2>
                    {historico ? <GraficoMensual meses={historico} /> : <p className="vacio">Cargando…</p>}
                </section>

                <section className="tarjeta familias">
                    <h2>Ventas por familia</h2>
                    {completo && familias?.length === 0 && <p className="vacio">Sin ventas en el periodo</p>}
                    <ul>
                        {familias?.map((familia) => (
                            <li key={familia.codigo}>
                                <details>
                                    <summary>
                                        <div className="fila">
                                            <strong>{familia.descripcion}</strong>
                                            <span>{euros.format(familia.importe)}</span>
                                        </div>
                                        <div className="fila">
                                            <span className="secundario">
                                                {familia.objetivo
                                                    ? `${Math.round(porcentajeConseguido(familia.importe, familia.objetivo) ?? 0)} % de ${euros.format(familia.objetivo)}`
                                                    : "Sin objetivo"}
                                            </span>
                                            <Variacion actual={familia.importe} anterior={familia.importeAnterior} />
                                        </div>
                                        {familia.objetivo !== null && (
                                            <IndicadorProgreso conseguido={porcentajeConseguido(familia.importe, familia.objetivo)} tiempo={tiempo} />
                                        )}
                                    </summary>
                                    <ul className="subfamilias">
                                        {familia.subfamilias.map((subfamilia) => (
                                            <li key={subfamilia.codigo} className="fila">
                                                <span>{subfamilia.descripcion}</span>
                                                <span>
                                                    {euros.format(subfamilia.importe)}{" "}
                                                    <Variacion actual={subfamilia.importe} anterior={subfamilia.importeAnterior} />
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </LayoutSmartsales>
    );
};
