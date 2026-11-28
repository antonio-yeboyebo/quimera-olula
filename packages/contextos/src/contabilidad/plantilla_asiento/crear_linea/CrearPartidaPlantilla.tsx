import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { FormPartidaPlantilla } from "../comun/FormPartidaPlantilla.tsx";
import { PlantillaAsiento } from "../diseño.ts";
import { metaPartidaPlantilla, nuevaPartidaPlantillaVacia } from "../dominio.ts";
import { postPartidaPlantilla } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const CrearPartidaPlantilla = ({
    plantilla,
    publicar,
}: {
    plantilla: PlantillaAsiento;
    publicar: EmitirEvento;
}) => {
    // Memoizado: useModelo se reinicia si cambia la identidad del inicial.
    const t = useTContabilidad();
    const inicial = useMemo(nuevaPartidaPlantillaVacia, []);
    const { modelo, uiProps, valido } = useModelo(metaPartidaPlantilla, inicial);

    const crear_ = useCallback(async () => {
        const id = await postPartidaPlantilla(plantilla.id, modelo);
        publicar("linea_creada", id);
    }, [modelo, publicar, plantilla.id]);

    const cancelar_ = useCallback(() => publicar("alta_de_linea_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    return (
        <QModal abierto={true} nombre="crearPartidaPlantilla" titulo={t("plantilla_asiento.nuevaPartidaPredefinida")} onCerrar={cancelar}>
            <FormPartidaPlantilla modelo={modelo} uiProps={uiProps} />
            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido}>
                    {t("plantilla_asiento.crear")}
                </QBoton>
            </div>
        </QModal>
    );
};
