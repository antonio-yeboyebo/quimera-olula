import { CrearLineaProps } from "#/ventas/pedido/crear_linea/CrearLinea.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { useFocus } from "@olula/lib/useFocus.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { TipoPalet } from "../../comun/componentes/TipoPalet.tsx";
import { Variedad } from "../../comun/componentes/Variedad.tsx";
import "./CrearLinea.css";
import { FormCrearLineaDefecto, metaCrearLinea, postLineaNrj } from "./crear_linea.ts";

export const CrearLineaNrj = ({
    pedidoId,
    publicar,
}: CrearLineaProps) => {

    const { modelo, uiProps, valido } = useModelo(
        metaCrearLinea,
        FormCrearLineaDefecto
    );
    
    const crear = useCallback(async () => {
        await postLineaNrj(pedidoId, modelo);
        publicar("alta_linea_lista");
    }, [modelo, publicar, pedidoId]);
    
    const cancelar = useCallback(() => {
        publicar("crear_linea_cancelado");
    }, [publicar]);

    const focus = useFocus();

    const cantidadEnvasesNominal = modelo.cantidadPalets * modelo.envasesPorPalet;

    return (
        <QModal abierto={true} nombre="mostrar" onCerrar={cancelar}>
            <div className="CrearLinea">
                
                <h2>Crear línea NRJ</h2>

                <quimera-formulario>
                    <Variedad label="Variedad" {...uiProps("idVariedad", "variedad")} ref={focus} />
                    <TipoPalet label="Tipo Palet" {...uiProps("idTipoPalet", "tipopalet")}  />
                    <QInput label="Cantidad Palets" {...uiProps("cantidadPalets") } nombre='cantidadPalets'/>
                    <div id='espacio4'>
                        {`Envases por palet: ${modelo.envasesPorPalet}`}     
                    </div>
                    <div id='espacio4'>
                        {`Cantidad Envases Nominal: ${cantidadEnvasesNominal}`}     
                    </div>
                    <div id='espacio4'/>
                    <div id='espacio4'/>
                    <QInput label="Cantidad Envases" {...uiProps("cantidadEnvases") } nombre='cantidadEnvases'/> 
                </quimera-formulario>

                <div className="botones maestro-botones ">
                    <QBoton texto='Crear' onClick={crear} deshabilitado={!valido}
                    />
                </div>
            </div>
        </QModal>
    );
};
