import { ArqueoTpv } from "#/tpv/arqueo/diseño.ts";
import { patchCerrarArqueo } from "#/tpv/arqueo/infraestructura.ts";
import { agenteActivo } from "#/tpv/comun/infraestructura.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useMemo, useState } from "react";
import { moneda } from "../dominio.ts";
import "./CerrarArqueoTpv.css";
import { cierreArqueoTpvVacio, metaCierreArqueoTpv } from "./cerrar_arqueo.ts";

export const CerrarArqueoTpv = ({
    arqueo,
    publicar,
}: {
    arqueo: ArqueoTpv,
    publicar: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);

    const cierreInicial = useMemo(
        () => ({
            ...cierreArqueoTpvVacio,
            movimientoCierre: arqueo.recuentoEfectivo,
            idAgenteCierre: agenteActivo.obtener()?.id ?? '',
            totalEfectivo: arqueo.recuentoEfectivo
        }),
        [arqueo]
    );

    const { modelo, uiProps, valido, init } = useModelo(metaCierreArqueoTpv, cierreInicial);

    const [cerrando, setCerrando] = useState(false);

    const movimientoCierre = arqueo.recuentoEfectivo - modelo.cambioDejadoEnCaja;
  
    const cerrar = useCallback(
        async () => {
            setCerrando(true);
            await intentar(
                () => patchCerrarArqueo(arqueo.id, {
                    movimientoCierre,
                    idAgenteCierre: modelo.idAgenteCierre
                })
            );
            publicar("cierre_hecho");
        },
        [arqueo, intentar, modelo, publicar, setCerrando]
    );

    const cancelar = useCallback(
        () => {
            if (!cerrando) publicar("cierre_cancelado");
        },
        [cerrando, publicar]
    );

    const limpiar = () => {
        init({
            ...cierreArqueoTpvVacio,
            idAgenteCierre: agenteActivo.obtener()?.id ?? '',
        });
    }
    
    return (
        <QModal abierto={true} nombre="mostrar" onCerrar={cancelar}>
    
            <div className="CierreArqueo">
            
                <h2>Cierre de arqueo</h2>

                <quimera-formulario>
                    <div id='cierre'>
                        {`Total efectivo: ${moneda(arqueo.recuentoEfectivo)}`}
                    </div>
                    <div id='cierre'>
                        {`Sale de caja: ${moneda(movimientoCierre)}`}
                    </div>

                    <QInput label="Cambio dejado en caja" {...uiProps("cambioDejadoEnCaja")} />
                </quimera-formulario>
            
                <div className="botones maestro-botones ">
                    <QBoton onClick={limpiar}>Limpiar</QBoton>
                </div>

                <div className="botones maestro-botones ">
                    <QBoton onClick={cerrar}
                        deshabilitado={!valido}>
                        Cerrar    
                    </QBoton>
                </div>

            </div>

        </QModal>
    );
};
