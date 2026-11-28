import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { postPlantillaAsiento } from "../infraestructura.ts";
import { metaNuevaPlantillaAsiento, nuevaPlantillaAsientoVacia } from "./crear.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const CrearPlantillaAsiento = ({ publicar }: { publicar: EmitirEvento }) => {
    // Memoizado: useModelo se reinicia si cambia la identidad del inicial.
    const t = useTContabilidad();
    const inicial = useMemo(nuevaPlantillaAsientoVacia, []);
    const { modelo, uiProps, valido } = useModelo(metaNuevaPlantillaAsiento, inicial);

    const crear_ = useCallback(async () => {
        const id = await postPlantillaAsiento(modelo);
        publicar("plantilla_creada", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_plantilla_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);
    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="crearPlantillaAsiento" titulo={t("plantilla_asiento.nuevaPlantillaDeAsiento")} onCerrar={cancelar}>
            <div className="CrearPlantillaAsiento">
                <quimera-formulario>
                    <QInput label={t("plantilla_asiento.codigo")} {...uiProps("codigo")} ref={focus} />
                    <QInput label={t("plantilla_asiento.descripcion")} {...uiProps("descripcion")} />
                    <QInput label={t("plantilla_asiento.concatenarCon")} {...uiProps("concatenar")} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("plantilla_asiento.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
