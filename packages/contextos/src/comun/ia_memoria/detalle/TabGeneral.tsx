import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { QInput } from "@olula/componentes/index.js";
import { FormModelo } from "@olula/lib/dominio.js";
import "./TabGeneral.css";
import { tComun } from "../../i18n/index.ts";

/**
 * Tab General: formulario de edición de la memoria del asistente.
 *
 * Layout: usa <quimera-formulario> (grid de 12 columnas).
 * El campo `contenido` es texto largo (contexto de negocio para la IA);
 * se usa QTextArea en lugar del editor enriquecido porque el backend
 * almacena el campo como texto plano, no como JSON estructurado.
 *
 * `activo` no se edita aquí: se alterna con la acción "Activar/Desactivar"
 * (ver DetalleIaMemoria.tsx y la nota en dominio.ts).
 */
interface TabGeneralProps {
    form: FormModelo;
}

export const TabGeneral = ({ form }: TabGeneralProps) => {
    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label={tComun("iaMemoria.titulo")} {...uiProps("titulo")} />
                <QTextArea label={tComun("iaMemoria.contenido")} rows={12} {...uiProps("contenido")} />
            </quimera-formulario>
        </div>
    );
};
