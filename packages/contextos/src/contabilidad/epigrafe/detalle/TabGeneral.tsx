import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { GrupoEpigrafeSelector } from "#/contabilidad/comun/componentes/GrupoEpigrafeSelector.tsx";
import { Epigrafe } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

interface TabGeneralProps {
    form: FormModelo;
    epigrafe: Epigrafe;
}

export const TabGeneral = ({ form, epigrafe }: TabGeneralProps) => {

    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label={tContabilidad("epigrafe.codigo")} {...uiProps("codigo")} />
                <QInput label={tContabilidad("epigrafe.descripcion")} {...uiProps("descripcion")} />
                {/* El segundo campo de uiProps guarda el código del grupo
                    junto al id, que es lo que muestra el autocompletar. */}
                <GrupoEpigrafeSelector
                    ejercicioId={epigrafe.ejercicioId}
                    {...uiProps("grupoId", "codigoGrupo")}
                />
                <QInput
                    label={tContabilidad("epigrafe.ejercicio")}
                    nombre="ejercicio_id"
                    valor={epigrafe.ejercicioId}
                    soloLectura
                />
            </quimera-formulario>
        </div>
    );
};
