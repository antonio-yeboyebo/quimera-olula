import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import "./TabGeneral.css";
import { useTVentas } from "../../i18n/index.ts";

interface TabGeneralProps {
    form: FormModelo;
}

export const TabGeneral = ({ form }: TabGeneralProps) => {
    const t = useTVentas();

    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label={t("agente.campos.nombre")} {...uiProps("nombre_pila")} />
                <QInput label={t("agente.campos.apellidos")} {...uiProps("apellidos")} />
                <QInput label={t("agente.campos.dniCif")} {...uiProps("id_fiscal")} />
                <QInput label={t("agente.campos.comision")} {...uiProps("por_comision")} />
                <QInput label={t("agente.campos.usuario")} {...uiProps("usuario_id")} soloLectura />
            </quimera-formulario>
        </div>
    );
};
