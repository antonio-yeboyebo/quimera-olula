import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { SelectorAgente } from "../../comun/componentes/SelectorAgente.tsx";
import { textoEstadoTrato } from "../../clientes/dominio.ts";
import { EstadoTratoFiltro, FiltrosTratos, OrigenTrato, TotalesTratos, TratoLista } from "../diseño.ts";
import { getTotalesTratos, getTratos } from "../infraestructura.ts";
import "./Tratos.css";

type Pestaña = "mios" | "todos";

const ESPERA_FILTROS = 400;

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const chips: Record<Exclude<OrigenTrato, null>, string> = {
    mkt: "mkt",
    farma: "farma",
    campaña: "campaña",
};

const varianteEstado = (estado: string) => (estado === "Ganado" ? "exito" : estado === "Perdido" ? "error" : "advertencia");

const fechaCorta = (iso: string | null) =>
    iso ? new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "—";

const filtrosIniciales: Omit<FiltrosTratos, "agente"> = {
    estado: "abiertos",
    titulo: "",
    contacto: "",
    codCliente: "",
    cifNif: "",
    desde: "",
    hasta: "",
};

export const Tratos = () => {
    const { intentar } = useContext(ContextoError);
    const { usuario, agenteSeguido, puedeVerOtros, cargando } = useAgenteSeguido();
    const [pestaña, setPestaña] = useState<Pestaña>("mios");
    const [filtros, setFiltros] = useState(filtrosIniciales);
    const [verFiltros, setVerFiltros] = useState(false);
    const [tratos, setTratos] = useState<TratoLista[]>([]);
    const [totales, setTotales] = useState<TotalesTratos | null>(null);

    const cambiar = (cambios: Partial<typeof filtros>) => setFiltros((actual) => ({ ...actual, ...cambios }));
    const tipoTratoFarma = usuario?.tipoTratoFarma ?? null;

    useEffect(() => {
        if (cargando) return;
        const completos: FiltrosTratos = { ...filtros, agente: pestaña === "mios" ? agenteSeguido : null };
        const temporizador = setTimeout(() => {
            const cargar = async () => {
                const [nuevosTratos, nuevosTotales] = await intentar(() =>
                    Promise.all([getTratos(completos, tipoTratoFarma), getTotalesTratos(completos)])
                );
                setTratos(nuevosTratos);
                setTotales(nuevosTotales);
            };
            cargar().catch(() => undefined);
        }, ESPERA_FILTROS);
        return () => clearTimeout(temporizador);
    }, [intentar, cargando, pestaña, agenteSeguido, filtros, tipoTratoFarma]);

    const contador = (estado: EstadoTratoFiltro, texto: string, valor: number | undefined) => (
        <button type="button" aria-pressed={filtros.estado === estado} onClick={() => cambiar({ estado })}>
            {texto} ({valor ?? "…"})
        </button>
    );

    return (
        <LayoutSmartsales>
            <div className="Tratos">
                <header>
                    <h1>Tratos</h1>
                    <QBoton enlace={rutasSmartsales.nuevoTrato} tamaño="pequeño">
                        + Nuevo trato
                    </QBoton>
                </header>

                {puedeVerOtros && (
                    <div className="pestañas" role="tablist">
                        {(["mios", "todos"] as Pestaña[]).map((valor) => (
                            <button key={valor} type="button" role="tab" aria-selected={pestaña === valor} onClick={() => setPestaña(valor)}>
                                {valor === "mios" ? "Mis tratos" : "Todos"}
                            </button>
                        ))}
                    </div>
                )}

                {pestaña === "mios" && <SelectorAgente />}

                <div className="contadores">
                    {contador("abiertos", "Abiertos", totales?.abiertos)}
                    {contador("ganados", "Ganados", totales?.ganados)}
                    {contador("perdidos", "Perdidos", totales?.perdidos)}
                    <button type="button" aria-pressed={filtros.estado === "todos"} onClick={() => cambiar({ estado: "todos" })}>
                        Todos
                    </button>
                </div>

                <QBoton variante="texto" tamaño="pequeño" onClick={() => setVerFiltros(!verFiltros)}>
                    {verFiltros ? "Ocultar filtros" : "Filtros"}
                </QBoton>
                {verFiltros && (
                    <div className="filtros">
                        <QInput label="Título" nombre="f_titulo" valor={filtros.titulo} onChange={(titulo) => cambiar({ titulo })} />
                        <QInput label="Contacto" nombre="f_contacto" valor={filtros.contacto} onChange={(contacto) => cambiar({ contacto })} />
                        <QInput label="Código de cliente" nombre="f_cliente" valor={filtros.codCliente} onChange={(codCliente) => cambiar({ codCliente })} />
                        <QInput label="CIF/NIF" nombre="f_cifnif" valor={filtros.cifNif} onChange={(cifNif) => cambiar({ cifNif })} />
                        <QInput label="Desde" nombre="f_desde" tipo="fecha" valor={filtros.desde} onChange={(desde) => cambiar({ desde })} />
                        <QInput label="Hasta" nombre="f_hasta" tipo="fecha" valor={filtros.hasta} onChange={(hasta) => cambiar({ hasta })} />
                    </div>
                )}

                {tratos.length === 0 && <p className="vacio">No hay tratos con estos filtros</p>}
                {tratos.length > 0 && (
                    <ul className="tarjeta lista">
                        {tratos.map((trato) => (
                            <li key={trato.id}>
                                <Link to={rutasSmartsales.trato(trato.id)}>
                                    <span className="icono">
                                        <QIcono nombre="documento_nuevo" tamaño="sm" />
                                    </span>
                                    <span className="datos">
                                        <span className="titulo">
                                            <strong>{trato.titulo}</strong>
                                            {trato.origen && (
                                                <QEtiqueta variante="neutro">{chips[trato.origen]}</QEtiqueta>
                                            )}
                                        </span>
                                        <span className="secundario">{[trato.cliente, trato.contacto].filter(Boolean).join(" · ")}</span>
                                        <span className="secundario">Valor: {euros.format(trato.valor)}</span>
                                    </span>
                                    <span className="lado">
                                        <QEtiqueta variante={varianteEstado(trato.estado)}>{textoEstadoTrato(trato.estado)}</QEtiqueta>
                                        <span className="secundario">{fechaCorta(trato.fecha)}</span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </LayoutSmartsales>
    );
};
