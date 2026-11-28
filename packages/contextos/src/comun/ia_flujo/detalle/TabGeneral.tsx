import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { QInput } from "@olula/componentes/index.js";
import { FormModelo } from "@olula/lib/dominio.js";
import "./TabGeneral.css";
import { tComun } from "../../i18n/index.ts";

/**
 * Tab General: formulario de edición del flujo de trabajo.
 *
 * El campo `contenido` (los pasos del flujo) es texto largo; se usa
 * QTextArea porque el backend almacena el campo como texto plano.
 *
 * `activo` no se edita aquí: se alterna con la acción "Activar/Desactivar"
 * (ver DetalleIaFlujo.tsx y la nota en dominio.ts).
 */
interface TabGeneralProps {
    form: FormModelo;
}

export const TabGeneral = ({ form }: TabGeneralProps) => {
    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label={tComun("iaFlujo.nombre")} {...uiProps("nombre")} />
                <QInput label={tComun("iaFlujo.descripcionCorta")} {...uiProps("descripcionCorta")} />
                <QTextArea label={tComun("iaFlujo.contenidoPasos")} rows={12} {...uiProps("contenido")} />
            </quimera-formulario>
        </div>
    );
};
