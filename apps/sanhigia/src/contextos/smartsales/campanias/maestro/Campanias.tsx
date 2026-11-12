import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { porcentajeConseguido } from "../../comun/dominio.ts";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { IndicadorProgreso } from "../../comun/componentes/IndicadorProgreso.tsx";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { SelectorAgente } from "../../comun/componentes/SelectorAgente.tsx";
import { CampaniaLista } from "../diseño.ts";
import { textoTipoCampania } from "../dominio.ts";
import { getCampanias } from "../infraestructura.ts";
import "./Campanias.css";

const fecha = (iso: string | null) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES") : "—");

export const Campanias = () => {
    const { intentar } = useContext(ContextoError);
    const { agenteSeguido, cargando } = useAgenteSeguido();
    const [campanias, setCampanias] = useState<CampaniaLista[] | null>(null);

    useEffect(() => {
        if (cargando) return;
        setCampanias(null);
        const cargar = async () => setCampanias(await intentar(() => getCampanias(agenteSeguido)));
        cargar().catch(() => undefined);
    }, [intentar, cargando, agenteSeguido]);

    return (
        <LayoutSmartsales>
            <div className="Campanias">
                <header>
                    <h1>Mis campañas</h1>
                    <QBoton tamaño="pequeño" enlace={rutasSmartsales.nuevaCampania}>
                        + Nueva campaña
                    </QBoton>
                </header>

                <SelectorAgente />

                {campanias === null && <p className="vacio">Cargando…</p>}
                {campanias?.length === 0 && <p className="vacio">Todavía no hay campañas</p>}

                <ul className="lista-campanias">
                    {campanias?.map((campania) => (
                        <li key={campania.id}>
                            <Link to={rutasSmartsales.campania(campania.id)} className="tarjeta">
                                <strong>{campania.nombre}</strong>
                                <span className="secundario">
                                    {textoTipoCampania[campania.tipo] ?? campania.tipo} · {fecha(campania.fechaAlta)} · {campania.totales} clientes
                                </span>
                                <span className="secundario">
                                    Trabajados {campania.ganados + campania.perdidos} · Conseguidos {campania.ganados}
                                </span>
                                <IndicadorProgreso
                                    conseguido={porcentajeConseguido(campania.ganados + campania.perdidos, campania.totales)}
                                    tiempo={0}
                                />
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </LayoutSmartsales>
    );
};
