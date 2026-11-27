import { QInput } from "@olula/componentes/index.js";
import { FormModelo } from "@olula/lib/dominio.js";
import "./TabGeneral.css";
import { tComun } from "../../i18n/index.ts";

interface TabGeneralProps {
    form: FormModelo;
}

/**
 * Tab General: nombre y proveedor (editables, auto-guardado). `tipoAuth` y
 * el secreto no aparecen aquí — ver TabInformacion (solo lectura) y la
 * acción "Editar credencial" respectivamente.
 */
export const TabGeneral = ({ form }: TabGeneralProps) => {
    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label={tComun("credencialExterna.nombre")} {...uiProps("nombre")} />
                <QInput label={tComun("credencialExterna.proveedor")} {...uiProps("proveedor")} />
            </quimera-formulario>
        </div>
    );
};
