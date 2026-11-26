import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { tContabilidad } from "../../i18n/index.ts";

interface TabCriteriosProps {
    form: FormModelo;
}

/** Pestaña «Criterios» de `co_i_patrimonio.ui`: descripción, ejercicio
 * actual y ejercicios anteriores. */
export const TabCriterios = ({ form }: TabCriteriosProps) => {
    const { uiProps } = form;

    return (
        <div className="TabCriterios">
            <quimera-formulario>
                <QInput label={tContabilidad("patrimonio_neto.descripcion")} {...uiProps("descripcion")} />
                <QInput label={tContabilidad("patrimonio_neto.ejercicioActual")} {...uiProps("ejercicioId")} />
                <QInput
                    label={tContabilidad("patrimonio_neto.ejercicioX1")}
                    {...uiProps("ejercicioAnteriorId")}
                    opcional
                />
                <QInput
                    label={tContabilidad("patrimonio_neto.ejercicioX2")}
                    {...uiProps("ejercicioAnteriorAnteriorId")}
                    opcional
                />
            </quimera-formulario>
        </div>
    );
};
