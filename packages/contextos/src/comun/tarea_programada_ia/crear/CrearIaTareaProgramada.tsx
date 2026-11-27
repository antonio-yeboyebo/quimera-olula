import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { SelectorCredenciales } from "../componentes/SelectorCredenciales.js";
import { SelectorIaFlujo } from "../componentes/SelectorIaFlujo.js";
import { SelectorProgramacion } from "../componentes/SelectorProgramacion.js";
import { postIaTareaProgramada } from "../infraestructura.js";
import "./CrearIaTareaProgramada.css";
import { metaNuevaIaTareaProgramada, nuevaIaTareaProgramadaVacia } from "./crear.js";
import { useTComun } from "../../i18n/index.ts";

/**
 * Modal de alta de tarea programada de IA.
 *
 * Patrón:
 *   - El maestro lo renderiza condicionalmente cuando estado === "CREANDO".
 *   - Llama a postIaTareaProgramada internamente y emite:
 *       "tarea_programada_ia_creada"  con el ID devuelto por la API (éxito)
 *       "alta_cancelada"              sin payload                    (cancelar)
 */
export const CrearIaTareaProgramada = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const t = useTComun();
    const { modelo: tarea, uiProps, valido, set } = useModelo(
        metaNuevaIaTareaProgramada,
        nuevaIaTareaProgramadaVacia
    );

    const crear_ = useCallback(
        async () => {
            const id = await postIaTareaProgramada(tarea);
            publicar("tarea_programada_ia_creada", id);
        },
        [tarea, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("alta_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    const expresionCronProps = uiProps("expresionCron");

    return (
        <QModal
            abierto={true}
            nombre="crearIaTareaProgramada"
            titulo={t("tareaProgramadaIa.nuevaTareaProgramada")}
            onCerrar={cancelar}
        >
            <div className="CrearIaTareaProgramada">
                <quimera-formulario>
                    <QInput label={t("tareaProgramadaIa.nombre")} {...uiProps("nombre")} ref={focus} />
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

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("tareaProgramadaIa.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
