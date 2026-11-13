import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import "./TabGeneral.css";

export const TabGeneral = ({ form }: { form: FormModelo }) => {
    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label="Identificador" {...uiProps("id")} deshabilitado />
                <QInput label="Nombre" {...uiProps("nombre")} />
                <QInput label="NIF" {...uiProps("nif")} />
                <QInput label="Email de contacto" {...uiProps("emailContacto")} />
                <QInput label="Estado" {...uiProps("estado")} deshabilitado />
                <QInput label="Base de datos" {...uiProps("nombreBd")} deshabilitado />
                <QInput label="Versión del esquema" {...uiProps("versionEsquema")} deshabilitado />
                <QInput label="Fecha de alta" {...uiProps("fechaAlta")} deshabilitado />
            </quimera-formulario>
        </div>
    );
};
