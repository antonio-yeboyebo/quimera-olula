import { ArqueoTpv } from "#/tpv/arqueo/diseño.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { moneda, totalEfectivo, totalMovimientos } from "../dominio.ts";
import "./RecuentoArqueoTpv.css";
import { metaRecuentoArqueoTpv } from "./diseño.ts";
import { getRecuentoInicial, guardarRecuento, recuentoEfectivo } from "./recuento.ts";



export const RecuentoArqueoTpv = ({
    arqueo,
    publicar,
}: {
    arqueo: ArqueoTpv,
    publicar: EmitirEvento;
}) => {

    const recuentoInicial = useMemo(
        () => getRecuentoInicial(arqueo),
        [arqueo]
    );
    
    const { modelo, uiProps, valido, init } = useModelo(
        metaRecuentoArqueoTpv, 
        recuentoInicial,
    );

    const aceptar = useCallback(
        async() => {
            await guardarRecuento(arqueo, modelo);
            publicar("recuento_hecho");
        },
        [arqueo, modelo, publicar]
    );

    const cancelar = useCallback(
        () => publicar("recuento_cancelado")
        ,
        [publicar]
    );

    const limpiar = () => {
        init(getRecuentoInicial(arqueo));
    }
    
    return (
        <QModal abierto={true} nombre="recuento" onCerrar={cancelar}>
    
            <div className="RecuentoArqueo">
            
                <h2>Recuento de arqueo</h2>

                <quimera-formulario>
                    <h4>Recuento</h4>
                    <QInput label="B 500€" {...uiProps("b500")} />
                    <QInput label="B 200€" {...uiProps("b200")} />
                    <QInput label="B 100€" {...uiProps("b100")} />
                    <QInput label="B 50€" {...uiProps("b50")} />
                    <QInput label="B 20€" {...uiProps("b20")} />
                    <QInput label="B 10€" {...uiProps("b10")} />
                    <QInput label="B 5€" {...uiProps("b5")} />
                    <QInput label="M 2€" {...uiProps("m2")} />
                    <QInput label="M 1€" {...uiProps("m1")} />
                    <QInput label="M 50c" {...uiProps("m050")} />
                    <QInput label="M 20c" {...uiProps("m020")} />
                    <QInput label="M 10c" {...uiProps("m010")} />
                    <QInput label="M 5c" {...uiProps("m005")} />
                    <QInput label="M 2c" {...uiProps("m002")} />
                    <QInput label="M 1c" {...uiProps("m001")} />
                    <div id='recuento' >
                        {`Total: ${moneda(recuentoEfectivo(modelo))}`}
                    </div>
                    <QInput label="Tarjeta" {...uiProps("recuentoTarjeta")} />
                    <QInput label="Vales" {...uiProps("recuentoVales")} />

                    <h4>Teórico</h4>

                    <div id='recuento' >
                        {`Efectivo inicial: ${moneda(arqueo.efectivoInicial)}`}
                    </div>
                    <div id='recuento' >
                        {`Pagos efectivo: ${moneda(arqueo.pagosEfectivo)}`}
                    </div>
                    <div id='recuento' >
                        {`Movimientos efectivo: ${moneda(totalMovimientos(arqueo.movimientos))}`}
                    </div>
                    
                    <div id='recuento' >
                        {`Efectivo: ${moneda(totalEfectivo(arqueo))}`}
                    </div>
                    <div id='recuento' >
                        {`Tarjeta: ${moneda(arqueo.pagosTarjeta)}`}
                    </div>
                    <div id='recuento' >
                        {`Vale: ${moneda(arqueo.pagosVale)}`}
                    </div>

                    <h4>Diferencia</h4>
                    <div id='recuento' >
                        {`Efectivo: ${moneda(recuentoEfectivo(modelo) - totalEfectivo(arqueo))}`}
                    </div>
                    <div id='recuento' >
                        {`Tarjeta: ${moneda(modelo.recuentoTarjeta - arqueo.pagosTarjeta)}`}
                    </div>
                    <div id='recuento' >
                        {`Vale: ${moneda(modelo.recuentoVales - arqueo.pagosVale)}`}
                    </div>
                </quimera-formulario>
            
                <div className="botones maestro-botones ">
                    <QBoton onClick={limpiar}>Limpiar</QBoton>
                </div>

                <div className="botones maestro-botones ">
                    <QBoton onClick={aceptar}
                        deshabilitado={!valido}>
                        Guardar    
                    </QBoton>
                </div>

            </div>

        </QModal>
    );
};
