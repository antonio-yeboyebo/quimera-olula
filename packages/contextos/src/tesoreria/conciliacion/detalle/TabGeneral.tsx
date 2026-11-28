import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { MovimientoBancario } from "../diseño.js";
import { cuentaMovimientoBancario } from "../dominio.js";
import "./TabGeneral.css";
import { tTesoreria } from "../../i18n/index.ts";

interface TabGeneralProps {
    form: FormModelo;
    movimiento: MovimientoBancario;
}

export const TabGeneral = ({ form, movimiento }: TabGeneralProps) => {

    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            {movimiento.eliminadoEnBanco && (
                <QAviso variante="error">
                    {tTesoreria("conciliacion.esteMovimientoYaNoApareceEn")}
                </QAviso>
            )}
            {movimiento.pendiente && (
                <QAviso variante="advertencia">
                    {tTesoreria("conciliacion.elBancoTodaviaMarcaEsteMovimiento")}
                </QAviso>
            )}

            <quimera-formulario>
                <div id="cuenta">{cuentaMovimientoBancario(movimiento)}</div>
                <QInput label={tTesoreria("conciliacion.institucion")} {...uiProps("institucionNombre")} />
                <QInput label={tTesoreria("conciliacion.fecha")} {...uiProps("fecha")} />
                <QInput label={tTesoreria("conciliacion.fechaValor")} {...uiProps("fechaValor")} />
                <QInput label={tTesoreria("conciliacion.concepto")} {...uiProps("concepto")} />
                <QInput label={tTesoreria("conciliacion.contraparte")} {...uiProps("contraparte")} />
                <QInput label={tTesoreria("conciliacion.referencia")} {...uiProps("referencia")} />
                <QInput label={tTesoreria("conciliacion.importe")} {...uiProps("importe")} />
                <QInput label={tTesoreria("conciliacion.idEnElBanco")} {...uiProps("idExterno")} />
            </quimera-formulario>
        </div>
    );
};
