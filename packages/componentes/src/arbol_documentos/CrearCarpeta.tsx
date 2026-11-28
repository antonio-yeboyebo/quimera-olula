import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { DocumentosAPI } from "@olula/lib/api/documentos.ts";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { carpetaVacia, metaNuevaCarpeta } from "./crear_carpeta.ts";
import { useTComponentes } from "../i18n/textos.ts";

/**
 * Modal de alta de carpeta dentro del árbol documental.
 *
 * Patrón:
 *   - El padre lo renderiza condicionalmente cuando estado === "creando_carpeta".
 *   - Llama a DocumentosAPI.crearCarpeta internamente y emite:
 *       "carpeta_creada"                sin payload (éxito, recarga el árbol)
 *       "creacion_carpeta_cancelada"    sin payload (cancelar)
 *   - No recibe prop `activo`; la visibilidad la controla el padre.
 */
export interface CrearCarpetaProps {
    vinculoTipo: string;
    vinculoId: string;
    publicar: EmitirEvento;
}

export const CrearCarpeta = ({ vinculoTipo, vinculoId, publicar }: CrearCarpetaProps) => {
    const t = useTComponentes();
    const { modelo: carpeta, uiProps, valido } = useModelo(metaNuevaCarpeta, carpetaVacia);

    const crear_ = useCallback(async () => {
        await DocumentosAPI.crearCarpeta(carpeta.nombre, vinculoTipo, vinculoId);
        publicar("carpeta_creada");
    }, [carpeta, vinculoTipo, vinculoId, publicar]);

    const cancelar_ = useCallback(() => publicar("creacion_carpeta_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="mostrar" titulo={t("ui.arbolDocumentos.nuevaCarpeta")} onCerrar={cancelar}>
            <div className="CrearCarpeta">
                <quimera-formulario>
                    <QInput label={t("ui.arbolDocumentos.nombre")} {...uiProps("nombre")} ref={focus} />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("ui.arbolDocumentos.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
