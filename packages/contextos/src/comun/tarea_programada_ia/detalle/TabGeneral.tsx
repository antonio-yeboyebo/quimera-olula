import { QInput } from "@olula/componentes/index.js";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { IaTareaProgramada } from "../diseño.js";
import { SelectorCredenciales } from "../componentes/SelectorCredenciales.js";
import { SelectorIaFlujo } from "../componentes/SelectorIaFlujo.js";
import { SelectorProgramacion } from "../componentes/SelectorProgramacion.js";
import "./TabGeneral.css";
import { tComun } from "../../i18n/index.ts";

interface TabGeneralProps {
    form: HookModelo<IaTareaProgramada>;
}

/**
 * Tab General: formulario de edición de la tarea programada.
 *
 * `activo` no se edita aquí: se alterna con la acción "Activar/Desactivar"
 * (ver DetalleIaTareaProgramada.tsx), igual que en ia_flujo.
 */
export const TabGeneral = ({ form }: TabGeneralProps) => {
    const { modelo: tarea, uiProps, set } = form;
    const expresionCronProps = uiProps("expresionCron");

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label={tComun("tareaProgramadaIa.nombre")} {...uiProps("nombre")} />
                <SelectorIaFlujo {...uiProps("iaFlujoId")} />
                <SelectorProgramacion
                    valor={expresionCronProps.valor as string}
                    onChange={(cron) => expresionCronProps.onChange?.(cron)}
                />
                <SelectorCredenciales
                    valor={tarea.credencialIds}
                    onChange={(credencialIds) => set({ ...tarea, credencialIds })}
                />
            </quimera-formulario>
        </div>
    );
};
