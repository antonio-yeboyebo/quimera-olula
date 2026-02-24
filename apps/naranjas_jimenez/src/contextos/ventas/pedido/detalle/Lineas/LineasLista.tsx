import { LineasListaProps } from "#/ventas/pedido/detalle/Lineas/LineasLista.tsx";
import { LineaPedido } from "#/ventas/pedido/diseño.ts";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { QBoton, QModal } from "@olula/componentes/index.js";
import { useState } from "react";
import { LineaPedidoNrj } from "../../diseño.ts";

export const LineasListaNrj = ({
    lineas,
    seleccionada,
    publicar,
}: LineasListaProps<LineaPedidoNrj>) => {

    const setSeleccionada = (linea: LineaPedido) => {
        publicar("linea_seleccionada", linea);
    };

    return (
        <>
            <QTabla
                metaTabla={getMetaTablaLineas()}
                datos={lineas}
                cargando={false}
                seleccionadaId={seleccionada}
                onSeleccion={setSeleccionada}
                orden={["id", "ASC"]}
                onOrdenar={(_: string) => null}
            />
        </>
    );
};

const getMetaTablaLineas = () => {
    return [
        {
            id: "id",
            cabecera: "Línea",
        },
        {
            id: "idVariedad",
            cabecera: "Variedad",
        },
        {
            id: "cantidad",
            cabecera: "Cantidad", 
            tipo: "numero" as const,
        },
        {
            id: "cantidad_envases_asignados",
            cabecera: "Asignada", 
            render: (linea: LineaPedidoNrj) => AsignacionesLinea({linea}),
        },
    ];
};


const AsignacionesLinea = ({
    linea,
}: {
    linea: LineaPedidoNrj;
}) => {

    const [mostrando, setMostrando] = useState(false);

    return linea.cantidad_envases_asignados ? 
        
        <div>
            <QBoton texto={`${linea.cantidad_envases_asignados}`}
                tamaño="pequeño"
                onClick={() => setMostrando(true)}
            />
            <QModal abierto={mostrando} nombre="mostrar" onCerrar={() => setMostrando(false)}>
                <div className="CrearLinea">
                    
                    <h2>Asignaciones</h2>
    
                    <QTabla
                        metaTabla={getMetaTablaPalets()}
                        datos={linea.palets} 
                        cargando={false}
                        orden={["id", "ASC"]}
                        onOrdenar={(_: string) => null}
                    />
                </div>
            </QModal>
        </div>
        
    : 0;
};

const getMetaTablaPalets = () => {
    return [
        {
            id: "cantidadEnvases",
            cabecera: "Envases",
            tipo: "numero" as const
        },
    ];
};