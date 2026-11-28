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
                <QInput label={tTesoreria("conexion_bancaria.institucion")} {...uiProps("institucionNombre")} />
                <QInput label={tTesoreria("conexion_bancaria.estado")} {...uiProps("estado")} />
                <QInput label={tTesoreria("conexion_bancaria.ultimaSincronizacion")} {...uiProps("ultimaSincronizacion")} />
                <QInput label={tTesoreria("conexion_bancaria.ultimoError")} {...uiProps("ultimoError")} />
                <QInput label={tTesoreria("conexion_bancaria.conectadoEl")} {...uiProps("creadoEn")} />
            </quimera-formulario>
        </div>
    );
};
