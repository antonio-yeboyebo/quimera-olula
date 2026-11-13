import { AgenteTpv as CompAgenteTpv } from "#/tpv/comun/componentes/AgenteTpv.tsx";
import { PropsSelectorPuesto, SelectorPuestoTpv } from "#/tpv/comun/componentes/SelectorPuestoTpv.tsx";
import { agenteActivo } from "#/tpv/comun/infraestructura.ts";
import { useState } from "react";
import { AgenteTpv } from "../diseño.ts";

/** Agente que atiende en este puesto (se guarda en el navegador). */
export const AgenteTpvActual = () => {
  const [agente, setAgente] = useState<AgenteTpv | null>(() => agenteActivo.obtenerSeguro());

  const cambiarAgente = (nuevo: AgenteTpv) => {
    agenteActivo.actualizar(nuevo);
    setAgente(nuevo);
  };

  return (
    <SelectorPuestoTpv<AgenteTpv>
      actual={agente}
      Selector={SelectorAgente}
      onConfirmar={cambiarAgente}
    />
  );
};

const SelectorAgente = ({ onElegir, ...props }: PropsSelectorPuesto<AgenteTpv>) => (
  <CompAgenteTpv
    label="Agente"
    nombre="agente_actual"
    placeholder="elige agente"
    condensado
    onChange={(opcion) => onElegir((opcion as { agente?: AgenteTpv } | null)?.agente ?? null)}
    {...props}
  />
);
