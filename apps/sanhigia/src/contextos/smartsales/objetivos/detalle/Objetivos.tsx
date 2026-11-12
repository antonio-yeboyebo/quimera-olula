import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { Periodo } from "../../comun/diseño.ts";
import { periodoTrimestreActual, porcentajeConseguido, porcentajeTiempoTranscurrido } from "../../comun/dominio.ts";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { EtiquetaAfinidad } from "../../comun/componentes/EtiquetaAfinidad.tsx";
import { IndicadorProgreso } from "../../comun/componentes/IndicadorProgreso.tsx";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { SelectorAgente } from "../../comun/componentes/SelectorAgente.tsx";
import { SelectorPeriodo } from "../../comun/componentes/SelectorPeriodo.tsx";
import { ListaKpi } from "../../comun/componentes/ListaKpi.tsx";
import { ClienteRecomendado, LineaClientesNuevos, ObjetivosNuevosClientes } from "../diseño.ts";
import { sinRepetir, totalesKpi } from "../dominio.ts";
import { getClientesNuevos, getClientesRecomendados, getObjetivos } from "../infraestructura.ts";
import "./Objetivos.css";

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export const Objetivos = () => {
    const { intentar } = useContext(ContextoError);
    const { agenteSeguido, cargando } = useAgenteSeguido();
    const [periodo, setPeriodo] = useState<Periodo>(periodoTrimestreActual());
    const [objetivos, setObjetivos] = useState<ObjetivosNuevosClientes | null>(null);
    const [clientesNuevos, setClientesNuevos] = useState<LineaClientesNuevos[]>([]);
    const [recomendados, setRecomendados] = useState<ClienteRecomendado[] | null>(null);
    const [siguiente, setSiguiente] = useState<[number, number] | null>(null);
    const [buscando, setBuscando] = useState(false);

    const trimestres = periodo.tipo === "trimestres" ? periodo.trimestres : [];

    useEffect(() => {
        setObjetivos(null);
        setClientesNuevos([]);
        setRecomendados(null);
        if (cargando || trimestres.length === 0) return;
        const cargar = async () => {
            const [nuevosObjetivos, nuevosClientes] = await intentar(() =>
                Promise.all([getObjetivos(agenteSeguido, trimestres), getClientesNuevos(agenteSeguido, trimestres)])
            );
            setObjetivos(nuevosObjetivos);
            setClientesNuevos(nuevosClientes);
        };
        cargar().catch(() => undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intentar, cargando, agenteSeguido, periodo]);

    const verRecomendados = async (masDe: [number, number] | null) => {
        if (!objetivos) return;
        setBuscando(true);
        try {
            const pagina = await intentar(() => getClientesRecomendados(objetivos.familias, objetivos.subfamilias, masDe));
            setRecomendados((actuales) => sinRepetir([...(masDe ? (actuales ?? []) : []), ...pagina.clientes]));
            setSiguiente(pagina.siguiente);
        } finally {
            setBuscando(false);
        }
    };

    const totales = objetivos ? totalesKpi(objetivos.nuevosClientes) : null;
    const tiempo = objetivos?.nuevosClientes.rango ? porcentajeTiempoTranscurrido(objetivos.nuevosClientes.rango) : 0;
    const sinProductos = !objetivos || (objetivos.familias.length === 0 && objetivos.subfamilias.length === 0);

    return (
        <LayoutSmartsales>
            <div className="Objetivos">
                <header>
                    <h1>Objetivo de nuevos clientes</h1>
                </header>

                <SelectorAgente />
                <SelectorPeriodo periodo={periodo} onChange={setPeriodo} soloTrimestres />

                {trimestres.length === 0 && <p className="vacio">Elige al menos un trimestre</p>}

                {totales && (
                    <section className="tarjeta total">
                        <span className="secundario">Nuevos clientes conseguidos</span>
                        <span className="cifra">
                            {totales.alcanzada} <span className="objetivo">/ {totales.objetivo}</span>
                        </span>
                        <div className="progreso">
                            <IndicadorProgreso conseguido={porcentajeConseguido(totales.alcanzada, totales.objetivo)} tiempo={tiempo} />
                            <strong className="porcentaje">
                                {Math.round(porcentajeConseguido(totales.alcanzada, totales.objetivo) ?? 0)} %
                            </strong>
                        </div>
                    </section>
                )}

                <section className="tarjeta">
                    <h2>Por familia de producto</h2>
                    {objetivos && <ListaKpi bloque={objetivos.nuevosClientes} textoVacio="Sin objetivos de clientes nuevos en este periodo" />}
                </section>

                <section className="tarjeta">
                    <h2>Unidades por producto</h2>
                    {objetivos && <ListaKpi bloque={objetivos.unidades} textoVacio="Sin objetivos de unidades en este periodo" />}
                </section>

                <section className="tarjeta">
                    <h2>Clientes nuevos</h2>
                    {objetivos && clientesNuevos.length === 0 && <p className="vacio">Todavía no hay clientes nuevos en este periodo</p>}
                    {clientesNuevos.map((linea) => (
                        <div key={linea.clave} className="grupo">
                            <h3>{linea.descripcion}</h3>
                            <ul className="lista">
                                {linea.clientes.map((cliente) => (
                                    <li key={cliente.codCliente}>
                                        <Link to={rutasSmartsales.fichaCliente(cliente.codCliente)}>{cliente.nombre}</Link>
                                        <span className="secundario">{euros.format(cliente.importe)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>

                <section className="tarjeta">
                    <h2>Clientes recomendados</h2>
                    {recomendados === null && (
                        <QBoton ancho deshabilitado={buscando || sinProductos} onClick={() => verRecomendados(null).catch(() => undefined)}>
                            Ver clientes recomendados
                        </QBoton>
                    )}
                    {recomendados?.length === 0 && <p className="vacio">Sin recomendaciones para estas familias</p>}
                    <ul className="lista">
                        {recomendados?.map((cliente) => (
                            <li key={cliente.coddir}>
                                <Link to={rutasSmartsales.fichaCliente(cliente.codCliente)}>
                                    {cliente.nombre}
                                    {cliente.ciudad && <span className="secundario"> · {cliente.ciudad}</span>}
                                </Link>
                                <EtiquetaAfinidad score={cliente.score} conPorcentaje />
                            </li>
                        ))}
                    </ul>
                    {siguiente && (
                        <QBoton variante="borde" ancho deshabilitado={buscando} onClick={() => verRecomendados(siguiente).catch(() => undefined)}>
                            Ver más
                        </QBoton>
                    )}
                </section>
            </div>
        </LayoutSmartsales>
    );
};
