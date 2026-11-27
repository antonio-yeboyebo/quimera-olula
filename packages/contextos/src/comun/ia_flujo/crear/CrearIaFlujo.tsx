import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { postIaFlujo } from "../infraestructura.js";
import "./CrearIaFlujo.css";
import { metaNuevoIaFlujo, nuevoIaFlujoVacio } from "./crear.js";
import { useTComun } from "../../i18n/index.ts";

/**
 * Modal de alta de flujo de trabajo del asistente de IA.
 *
 * Patrón:
 *   - El maestro lo renderiza condicionalmente cuando estado === "CREANDO".
 *   - Llama a postIaFlujo internamente y emite:
 *       "ia_flujo_creado"   con el ID devuelto por la API (éxito)
 *       "alta_cancelada"    sin payload                    (cancelar)
 */
export const CrearIaFlujo = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const t = useTComun();
    const { modelo: iaFlujo, uiProps, valido } = useModelo(
        metaNuevoIaFlujo,
        nuevoIaFlujoVacio
    );

    const crear_ = useCallback(
        async () => {
            const id = await postIaFlujo(iaFlujo);
            publicar("ia_flujo_creado", id);
        },
        [iaFlujo, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("alta_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearIaFlujo"
            titulo={t("iaFlujo.nuevoFlujoDeTrabajo")}
            onCerrar={cancelar}
        >
            <div className="CrearIaFlujo">
                <quimera-formulario>
                    <QInput label={t("iaFlujo.nombre")} {...uiProps("nombre")} ref={focus} />
                    <QInput label={t("iaFlujo.descripcionCorta")} {...uiProps("descripcionCorta")} />
                    <QTextArea label={t("iaFlujo.contenidoPasos")} rows={8} {...uiProps("contenido")} />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("iaFlujo.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
