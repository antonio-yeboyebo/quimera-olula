import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { FormPartidaPlantilla } from "../comun/FormPartidaPlantilla.tsx";
import { CamposPartidaPlantilla as Campos, PartidaPlantilla, PlantillaAsiento } from "../diseño.ts";
import { metaPartidaPlantilla } from "../dominio.ts";
import { patchPartidaPlantilla } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const CambiarPartidaPlantilla = ({
    plantilla,
    partida,
    publicar,
}: {
    plantilla: PlantillaAsiento;
    partida: PartidaPlantilla;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const { modelo, uiProps, valido } = useModelo<Campos>(metaPartidaPlantilla, partida);

    const cambiar_ = useCallback(async () => {
        // El id no es un campo de la partida: no se manda.
        const { id: _id, ...cambios } = modelo as PartidaPlantilla;
        await patchPartidaPlantilla(plantilla.id, partida.id, cambios);
        publicar("linea_cambiada", partida);
    }, [modelo, publicar, plantilla.id, partida]);

    const cancelar_ = useCallback(() => publicar("cambio_de_linea_cancelado"), [publicar]);

    const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="cambiarPartidaPlantilla"
            titulo={t("plantilla_asiento.partidaNumeroorden", { numeroOrden: partida.numeroOrden })}
            onCerrar={cancelar}
        >
            <FormPartidaPlantilla modelo={modelo} uiProps={uiProps} />
            <div className="botones maestro-botones">
                <QBoton onClick={cambiar} deshabilitado={!valido}>
                    {t("plantilla_asiento.guardar")}
                </QBoton>
            </div>
        </QModal>
    );
};
