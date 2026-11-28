import { CuentaBancaria } from "#/tesoreria/comun/componentes/cuenta_bancaria.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import "./TabGeneral.css";
import { tTesoreria } from "../../i18n/index.ts";
import { textoEstado } from "../../comun/estados.ts";

interface TabGeneralProps {
    form: FormModelo;
}

export const TabGeneral = ({ form }: TabGeneralProps) => {

    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label={tTesoreria("remesa.fecha")} {...uiProps("fecha")} />
                <QInput label={tTesoreria("remesa.fechaDeCargo")} {...uiProps("fechaCargo")} />
                <QInput label={tTesoreria("remesa.estado")} {...uiProps("estado")} valor={textoEstado(String(uiProps("estado").valor ?? ""))} />
                <CuentaBancaria
                    label={tTesoreria("remesa.cuenta")}
                    {...uiProps("cuentaId", "descripcionCuenta")}
                    soloLectura
                />
                <QInput label={tTesoreria("remesa.total")} {...uiProps("total")} />
                <QInput label={tTesoreria("remesa.divisa")} {...uiProps("divisaId")} />
                <QInput label={tTesoreria("remesa.empresa")} {...uiProps("empresaId")} />
            </quimera-formulario>
        </div>
    );
};
