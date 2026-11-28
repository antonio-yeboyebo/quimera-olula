import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import "./TabGeneral.css";
import { tTesoreria } from "../../i18n/index.ts";

interface TabGeneralProps {
    form: FormModelo;
}

export const TabGeneral = ({ form }: TabGeneralProps) => {

    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label={tTesoreria("mandato.referencia")} {...uiProps("referencia")} />
                <QInput label={tTesoreria("mandato.tipo")} {...uiProps("tipo")} />
                <QInput label={tTesoreria("mandato.tipoDePago")} {...uiProps("tipoPago")} />
                <QInput label={tTesoreria("mandato.descripcion")} {...uiProps("descripcion")} />
                <QInput label={tTesoreria("mandato.cliente")} {...uiProps("clienteId")} />
                <QInput label={tTesoreria("mandato.nDeEfectos")} {...uiProps("numEfectos")} />
                <QInput label={tTesoreria("mandato.cuenta")} {...uiProps("cuentaId")} />
                <QInput label={tTesoreria("mandato.cuentaDelCliente")} {...uiProps("cuentaClienteId")} />
            </quimera-formulario>
        </div>
    );
};
