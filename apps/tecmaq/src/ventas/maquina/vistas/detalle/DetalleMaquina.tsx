import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Entidad, EmitirEvento } from "@olula/lib/diseño.ts";
import { useEffect } from "react";
import { Maquina } from "../../diseño.ts";
import { ArbolMaquina } from "./arbol/ArbolMaquina.tsx";
import "./DetalleMaquina.css";
import { contextoDetalleMaquinaInicial } from "./detalle.ts";
import { getMaquina } from "./maquina.ts";

const titulo = (m: Entidad) => {
    const maquina = m as Maquina;
    return `${maquina.referencia} \u2013 ${maquina.descripcion}`;
};

export const DetalleMaquina = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleMaquinaInicial, publicar);

    useEffect(() => {
        emitir("maquina_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.maquina.id) return null;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.maquina}
            cerrarDetalle={() => emitir("maquina_deseleccionada", null, true)}
        >
            <div className="DetalleMaquina">
                <div className="DetalleMaquina-cabecera">
                    <span>Cliente: {ctx.maquina.cliente}</span>
                    <span>Pedido: {ctx.maquina.codigoPedido}</span>
                    <span>Fecha: {ctx.maquina.fecha}</span>
                </div>
                <ArbolMaquina componentes={ctx.maquina.componentes} />
            </div>
        </Detalle>
    );
};
