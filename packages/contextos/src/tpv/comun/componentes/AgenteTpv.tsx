import { AgenteTpv as TipoAgenteTpv } from "#/tpv/agente/diseño.ts";
import { getAgentesTpv } from "#/tpv/agente/infraestructura.ts";
import { QSelect, QSelectProps } from "@olula/componentes/index.js";
import { Criteria } from "@olula/lib/diseño.js";
import { useEffect, useState } from "react";

type AgenteProps =  Omit<QSelectProps, 'opciones'>;

type OpcionAgente = {
    valor: string;
    descripcion: string;
    agente: TipoAgenteTpv
}

export const AgenteTpv = ({
    valor,
    nombre = "agente_tpv",
    label = "Agente",
    onChange,
    ...props
}: AgenteProps) => {

    const [agentes, setAgentes] = useState<OpcionAgente[]>([]);

    useEffect(() => {
        const obtenerOpciones = async () => {
            const criteria: Criteria = {
                filtro: [],
                orden: ["nombre"],
                paginacion: { limite: 1000, pagina: 1 },
            };

            const agentes_ = await getAgentesTpv(criteria);

            setAgentes(
                agentes_.datos.map((agente) => ({
                    valor: agente.id,
                    descripcion: agente.nombre,
                    agente: agente,
                }))
            );
        };
        obtenerOpciones();
    }, []);

    return  (
        <QSelect
            label={label}
            nombre={nombre}
            valor={valor}
            onChange={onChange}
            opciones={agentes}
            {...props}
        />
    )
};
