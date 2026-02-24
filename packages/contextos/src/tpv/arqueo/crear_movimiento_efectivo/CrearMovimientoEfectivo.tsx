import { agenteActivo } from "#/tpv/comun/infraestructura.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QDate, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { ArqueoTpv } from "../diseño.ts";
import { patchCrearMovimiento } from "../infraestructura.ts";
import { metaMovimientoEfectivo, movimientoEfectivoVacio } from "./crear_movimiento_efectivo.ts";
import "./CrearMovimientoEfectivo.css";
const miAgenteActivo = agenteActivo.obtener();

export const CrearMovimientoEfectivo = ({
  publicar,
  arqueo,
}: {
  publicar: EmitirEvento;
  arqueo: ArqueoTpv;
}) => {

    const { modelo, uiProps, valido } = useModelo(
        metaMovimientoEfectivo, movimientoEfectivoVacio
    );

    const crear = useCallback(
        async () => {
            await patchCrearMovimiento(
                arqueo.id,
                {
                    importe: modelo.importe,
                    fecha: modelo.fecha,
                    idAgente: miAgenteActivo.id
                }
            );
            publicar("movimiento_creado");
        },
        [modelo, publicar]
    );

    const cancelar = useCallback(
        () => publicar("creacion_de_movimiento_cancelada"),
        [publicar]
    );

    const focus = useFocus(true);

    return (
        <QModal abierto={true} nombre="mostrar" onCerrar={cancelar}>

            <div className="CrearMovimiento">

                <h2>Crear movimiento de efectivo</h2>

                <quimera-formulario>
                    <div id='agente'>
                        {`Agente: ${miAgenteActivo.id} ${miAgenteActivo.nombre}`}
                    </div>

                    <QInput label="Importe" {...uiProps("importe")} ref={focus}/>

                    <QDate label="Fecha" {...uiProps("fecha")}/>

                </quimera-formulario>

                <div className="botones maestro-botones ">
                    <QBoton texto="Crear"
                        onClick={crear} deshabilitado={!valido}
                    />
                </div>

            </div>

        </QModal>
    );
};
