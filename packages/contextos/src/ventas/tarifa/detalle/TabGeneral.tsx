import { Divisa } from "#/comun/componentes/divisa.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import "./TabGeneral.css";
import { useTVentas } from "../../i18n/index.ts";

/**
 * Tab General: formulario de cabecera de la tarifa.
 *
 * Layout: usa <quimera-formulario> (grid de 12 columnas). El posicionado de
 * cada campo se controla en TabGeneral.css mediante selectores de atributo
 * sobre el elemento renderizado. El atributo `nombre` llega automáticamente
 * al spread de uiProps("campo").
 */
interface TabGeneralProps {
    form: FormModelo;
    codigo: string;
}

export const TabGeneral = ({ form, codigo }: TabGeneralProps) => {
    const t = useTVentas();

    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                {/* El código lo genera el servidor y no es modificable. */}
                <QInput label="Código" nombre="codigo" valor={codigo} soloLectura />
                <QInput label={t("tarifa.maestro.nombre")} {...uiProps("nombre")} />
                <Divisa {...uiProps("divisaId")} nombre="tarifa/divisa_id" />
            </quimera-formulario>
        </div>
    );
};
