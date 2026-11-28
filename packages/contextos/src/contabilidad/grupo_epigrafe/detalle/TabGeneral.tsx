import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { GrupoEpigrafe } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

interface TabGeneralProps {
    form: FormModelo;
    grupo: GrupoEpigrafe;
}

export const TabGeneral = ({ form, grupo }: TabGeneralProps) => {

    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label={tContabilidad("grupo_epigrafe.codigo")} {...uiProps("codigo")} />
                <QInput label={tContabilidad("grupo_epigrafe.descripcion")} {...uiProps("descripcion")} />
                <QInput
                    label={tContabilidad("grupo_epigrafe.ejercicio")}
                    nombre="ejercicio_id"
                    valor={grupo.ejercicioId}
                    soloLectura
                />
            </quimera-formulario>
        </div>
    );
};
