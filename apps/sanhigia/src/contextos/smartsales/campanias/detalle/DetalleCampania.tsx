import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { porcentajeConseguido } from "../../comun/dominio.ts";
import { distanciaKm, Posicion, posicionActual } from "../../comun/geolocalizacion.ts";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { EtiquetaAfinidad } from "../../comun/componentes/EtiquetaAfinidad.tsx";
import { IndicadorProgreso } from "../../comun/componentes/IndicadorProgreso.tsx";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { ClienteCampania, ResumenCampania } from "../diseño.ts";
import { conVentas, recomendados, textoTipoCampania, totalesCampania, trabajados } from "../dominio.ts";
import { getResumenCampania } from "../infraestructura.ts";
import "../maestro/Campanias.css";

type Pestaña = "recomendados" | "trabajados" | "resultados";

const pestañas: [Pestaña, string][] = [
    ["recomendados", "Recomendados"],
    ["trabajados", "Trabajados"],
    ["resultados", "Resultados"],
];

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const fecha = (iso: string | null) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES") : "—");

const Barra = ({ texto, valor, total }: { texto: string; valor: number; total: number }) => (
    <div className="barra-campania">
        <div className="fila">
            <span>{texto}</span>
            <span className="secundario">
                {valor} / {total}
            </span>
        </div>
        <IndicadorProgreso conseguido={porcentajeConseguido(valor, total)} tiempo={0} />
    </div>
);

const TarjetaCliente = ({ cliente, posicion, conVisita }: { cliente: ClienteCampania; posicion: Posicion | null; conVisita: boolean }) => {
    const distancia = posicion ? distanciaKm(posicion, cliente.latitud, cliente.longitud) : null;
    return (
        <li className="cliente-campania">
            <span className="icono">
                <QIcono nombre="estrella" tamaño="sm" />
            </span>
            <Link to={rutasSmartsales.fichaCliente(cliente.codCliente)} className="datos">
                <strong>{cliente.nombre}</strong>
                <span className="secundario">
                    {[cliente.ciudad, distancia !== null && `${distancia.toFixed(1)} km`, cliente.estado !== "-" && cliente.estado]
                        .filter(Boolean)
                        .join(" · ")}
                </span>
                <span className="secundario">
                    {cliente.ventas12Meses > 0 ? `Ventas 12m: ${euros.format(cliente.ventas12Meses)}` : `Última compra ${fecha(cliente.ultimaCompra)}`}
                </span>
            </Link>
            <div className="lado">
                {cliente.afinidad !== null && <EtiquetaAfinidad score={cliente.afinidad} conPorcentaje />}
                {conVisita && (
                    <QBoton tamaño="pequeño" enlace={rutasSmartsales.nuevaTareaPara(cliente.codCliente, cliente.idTrato)}>
                        + Visita
                    </QBoton>
                )}
            </div>
        </li>
    );
};

export const DetalleCampania = () => {
    const { id = "" } = useParams();
    const { intentar } = useContext(ContextoError);
    const [resumen, setResumen] = useState<ResumenCampania | null>(null);
    const [pestaña, setPestaña] = useState<Pestaña>("recomendados");
    const [posicion, setPosicion] = useState<Posicion | null>(null);

    useEffect(() => {
        const cargar = async () => setResumen(await intentar(() => getResumenCampania(id)));
        cargar().catch(() => undefined);
    }, [intentar, id]);

    useEffect(() => {
        posicionActual().then(setPosicion);
    }, []);

    if (!resumen) {
        return (
            <LayoutSmartsales>
                <p>Cargando…</p>
            </LayoutSmartsales>
        );
    }

    const totales = totalesCampania(resumen.clientes);
    const conResultados = conVentas(resumen.clientes);
    const totalResultados = conResultados.reduce((total, c) => total + c.ventasCampania, 0);

    return (
        <LayoutSmartsales>
            <div className="Campanias">
                <header>
                    <div>
                        <h1>{resumen.nombre}</h1>
                        <span className="secundario">
                            {textoTipoCampania[resumen.tipo] ?? resumen.tipo} · {fecha(resumen.fechaAlta)}
                        </span>
                    </div>
                </header>
                {resumen.descripcion && <p className="descripcion">{resumen.descripcion}</p>}

                <section className="tarjeta">
                    <Barra texto="Clientes trabajados" valor={totales.trabajados} total={totales.total} />
                    <Barra texto="Clientes conseguidos" valor={totales.ganados} total={totales.total} />
                </section>

                <div className="pestañas" role="tablist">
                    {pestañas.map(([valor, texto]) => (
                        <button key={valor} type="button" role="tab" aria-selected={pestaña === valor} onClick={() => setPestaña(valor)}>
                            {texto}
                        </button>
                    ))}
                </div>

                {pestaña === "recomendados" && recomendados(resumen.clientes).length === 0 && <p className="vacio">Todos los clientes están trabajados</p>}
                {pestaña === "recomendados" && (
                    <ul className="tarjeta lista-clientes">
                        {recomendados(resumen.clientes).map((cliente) => (
                            <TarjetaCliente key={cliente.idTrato} cliente={cliente} posicion={posicion} conVisita />
                        ))}
                    </ul>
                )}

                {pestaña === "trabajados" && trabajados(resumen.clientes).length === 0 && <p className="vacio">Todavía no hay clientes trabajados</p>}
                {pestaña === "trabajados" && (
                    <ul className="tarjeta lista-clientes">
                        {trabajados(resumen.clientes).map((cliente) => (
                            <TarjetaCliente key={cliente.idTrato} cliente={cliente} posicion={posicion} conVisita={false} />
                        ))}
                    </ul>
                )}

                {pestaña === "resultados" && (
                    <section className="tarjeta">
                        <div className="fila">
                            <strong>Ventas desde el {fecha(resumen.fechaAlta)}</strong>
                            <strong>{euros.format(totalResultados)}</strong>
                        </div>
                        {conResultados.length === 0 && <p className="vacio">Todavía no hay ventas de la campaña</p>}
                        <ul className="lista">
                            {conResultados.map((cliente) => (
                                <li key={cliente.idTrato}>
                                    <Link to={rutasSmartsales.fichaCliente(cliente.codCliente)}>{cliente.nombre}</Link>
                                    <span>{euros.format(cliente.ventasCampania)}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </LayoutSmartsales>
    );
};
