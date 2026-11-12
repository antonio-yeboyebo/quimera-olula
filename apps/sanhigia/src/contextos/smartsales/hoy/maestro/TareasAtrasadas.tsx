import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { Tarea } from "../../comun/diseño.ts";
import { fechaIso, tareaAtrasada } from "../../comun/dominio.ts";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { TarjetaTarea } from "../../comun/componentes/TarjetaTarea.tsx";
import { getTareasRango } from "../../tareas/infraestructura.ts";
import { separarTareasHoy } from "../dominio.ts";

export const TareasAtrasadas = () => {
    const { intentar } = useContext(ContextoError);
    const { agenteSeguido, cargando } = useAgenteSeguido();
    const [tareas, setTareas] = useState<Tarea[]>([]);
    const hoy = fechaIso(new Date());

    useEffect(() => {
        if (cargando) return;
        const cargar = async () =>
            setTareas(await intentar(() => getTareasRango({ desde: hoy, hasta: hoy, agente: agenteSeguido, conAtrasadas: true })));
        cargar().catch(() => undefined);
    }, [intentar, cargando, agenteSeguido, hoy]);

    const atrasadas = tareas.filter((tarea) => tareaAtrasada(tarea));
    const { deHoy, anteriores } = separarTareasHoy(atrasadas, hoy);

    return (
        <LayoutSmartsales>
            <Link to={rutasSmartsales.hoy}>← Hoy</Link>
            <h1>Tareas atrasadas</h1>
            {atrasadas.length === 0 && <p>No tienes tareas atrasadas</p>}
            {[...anteriores, ...deHoy].map((tarea) => (
                <TarjetaTarea key={tarea.id} tarea={tarea} conFecha />
            ))}
        </LayoutSmartsales>
    );
};
