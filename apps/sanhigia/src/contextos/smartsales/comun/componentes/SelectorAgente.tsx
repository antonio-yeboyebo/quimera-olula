import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { useAgenteSeguido } from "../useAgenteSeguido.ts";

export const SelectorAgente = () => {
    const { agentes, agenteSeguido, puedeVerOtros, seguirAgente } = useAgenteSeguido();

    if (!puedeVerOtros) return null;

    const opciones = agentes.map((agente) => ({ valor: agente.codigo, descripcion: agente.nombre }));
    const seguido = opciones.find((opcion) => opcion.valor === agenteSeguido);

    const obtenerOpciones = async (texto: string, id?: string) => {
        if (id) return opciones.filter((opcion) => opcion.valor === id);
        const buscado = texto.toLowerCase();
        return opciones.filter((opcion) => opcion.descripcion.toLowerCase().includes(buscado));
    };

    return (
        <QAutocompletar
            label="Agente"
            nombre="agente_seguido"
            valor={agenteSeguido ?? ""}
            descripcion={seguido?.descripcion}
            longitudMinima={0}
            obtenerOpciones={obtenerOpciones}
            onChange={(opcion) => opcion && seguirAgente(opcion.valor)}
        />
    );
};
