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
                <QInput label={tTesoreria("remesa_pago.tipo")} {...uiProps("tipo")} valor={textoEstado(String(uiProps("tipo").valor ?? ""))} />
                <QInput label={tTesoreria("remesa_pago.fecha")} {...uiProps("fecha")} />
                <QInput label={tTesoreria("remesa_pago.fechaDePagoPrevista")} {...uiProps("fechaPago")} />
                <QInput label={tTesoreria("remesa_pago.estado")} {...uiProps("estado")} valor={textoEstado(String(uiProps("estado").valor ?? ""))} />
                <CuentaBancaria
                    label={tTesoreria("remesa_pago.cuenta")}
                    {...uiProps("cuentaId", "descripcionCuenta")}
                    soloLectura
                />
                <QInput label={tTesoreria("remesa_pago.total")} {...uiProps("total")} />
                <QInput label={tTesoreria("remesa_pago.divisa")} {...uiProps("divisaId")} />
                <QInput label={tTesoreria("remesa_pago.empresa")} {...uiProps("empresaId")} />
            </quimera-formulario>
        </div>
    );
};
