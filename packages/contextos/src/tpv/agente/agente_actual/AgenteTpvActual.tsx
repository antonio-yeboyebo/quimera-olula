import { AgenteTpv as CompAgenteTpv } from "#/tpv/comun/componentes/AgenteTpv.tsx";
import { agenteActivo } from "#/tpv/comun/infraestructura.ts";
import { QBoton } from "@olula/componentes/index.js";
import { useFocus } from "@olula/lib/useFocus.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useState } from "react";
import { AgenteTpv } from "../diseño.ts";
import { metaCambioAgenteActual } from "./agente_actual.ts";
import "./AgenteTpvActual.css";

const miAgenteActivo = agenteActivo.obtener() ;


export const AgenteTpvActual = () => {

    const [cambiando, setCambiando] = useState(false);
    const [agente, setAgente] = useState<AgenteTpv | null>(miAgenteActivo);

    const cambiarAgente = async (agente: AgenteTpv) => {
        console.log('Cambiando agente', agente);
        agenteActivo.actualizar(agente);
        setAgente(agente);
        setCambiando(false);
    };

    return (
        <div className="AgenteActual"> 
            { cambiando
                ?   <CambiarAgenteTpv 
                        agenteActual={agente}
                        cambiar={cambiarAgente}
                        cancelar={() => setCambiando(false)}
                    />
                :   <div className='inactivo'>
                        <h2>{agente?.nombre ?? ''} </h2>
                        <QBoton texto='...'
                            onClick={() => setCambiando(true)}
                            tamaño='pequeño'
                        />
                    </div>
            }
        </div>
    );
};


const CambiarAgenteTpv = ({
    agenteActual,
    cambiar,
    cancelar,
}: {
    agenteActual: AgenteTpv | null,
    cambiar: (agente: AgenteTpv) => void,
    cancelar: () => void
}) => {

    const { modelo, uiProps, valido } = useModelo(metaCambioAgenteActual, {
        idAgente: agenteActual?.id ?? null,
        nombre: agenteActual?.nombre ?? null,
        agente: agenteActual,
    });

    const focus = useFocus();

    const cambiarAgente = () => {
        cambiar(modelo.agente!);
    };

    return (
        <div className='seccion-activa'> 

            <quimera-formulario>
                <CompAgenteTpv 
                    label='Agente'
                    {...uiProps("idAgente", "nombre")}
                    nombre="agente_id"
                    ref={focus}
                />
            </quimera-formulario>

            <div className='maestro-botones'>
                <QBoton texto="Cancelar"
                    onClick={cancelar}
                />
                <QBoton texto="Cambiar"
                    onClick={cambiarAgente} deshabilitado={!valido}
                />
            </div>

        </div>
    );
};
