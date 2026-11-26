import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { tContabilidad } from "../../i18n/index.ts";

export const TabGeneral = ({ form }: { form: FormModelo }) => {
    const { uiProps } = form;
    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label={tContabilidad("plantilla_asiento.codigo")} {...uiProps("id")} soloLectura />
                <QInput label={tContabilidad("plantilla_asiento.descripcion")} {...uiProps("descripcion")} />
                <QInput label={tContabilidad("plantilla_asiento.concatenarCon")} {...uiProps("concatenar")} />
            </quimera-formulario>
            <p className="ayuda">
                {tContabilidad("plantilla_asiento.concatenarConEsElCodigoDe")}
            </p>
        </div>
    );
};
