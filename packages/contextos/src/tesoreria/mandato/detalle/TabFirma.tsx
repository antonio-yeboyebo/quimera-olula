import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import "./TabFirma.css";
import { tTesoreria } from "../../i18n/index.ts";

interface TabFirmaProps {
    form: FormModelo;
}

export const TabFirma = ({ form }: TabFirmaProps) => {

    const { uiProps } = form;

    return (
        <div className="TabFirma">
            <quimera-formulario>
                <QInput label={tTesoreria("mandato.fechaDeFirma")} {...uiProps("fechaFirma")} />
                <QInput label={tTesoreria("mandato.lugarDeFirma")} {...uiProps("lugarFirma")} />
                <QInput label={tTesoreria("mandato.fechaUltimoAdeudo")} {...uiProps("fechaUltimoAdeudo")} />
                <QInput label={tTesoreria("mandato.fechaDeCaducidad")} {...uiProps("fechaCaducidad")} />
            </quimera-formulario>
        </div>
    );
};
