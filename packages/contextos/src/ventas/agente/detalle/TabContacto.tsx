import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import "./TabContacto.css";
import { useTVentas } from "../../i18n/index.ts";

interface TabContactoProps {
    form: FormModelo;
}

export const TabContacto = ({ form }: TabContactoProps) => {
    const t = useTVentas();

    const { uiProps } = form;

    return (
        <div className="TabContacto">
            <quimera-formulario>
                <QInput label={t("agente.campos.telefono")} {...uiProps("telefono")} />
                <QInput label={t("agente.campos.email")} {...uiProps("email")} />
                <QInput label={t("agente.campos.direccion")} {...uiProps("direccion")} />
                <QInput label={t("agente.campos.codPostal")} {...uiProps("codpostal")} />
                <QInput label={t("agente.campos.ciudad")} {...uiProps("ciudad")} />
                <QInput label={t("agente.campos.provincia")} {...uiProps("provincia")} />
            </quimera-formulario>
        </div>
    );
};
