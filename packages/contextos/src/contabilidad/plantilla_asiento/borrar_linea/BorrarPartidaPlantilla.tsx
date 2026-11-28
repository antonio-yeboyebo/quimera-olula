import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { PartidaPlantilla, PlantillaAsiento } from "../diseño.ts";
import { deletePartidaPlantilla } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const BorrarPartidaPlantilla = ({
    plantilla,
    partida,
    publicar,
}: {
    plantilla: PlantillaAsiento;
    partida: PartidaPlantilla;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const borrar_ = useCallback(async () => {
        await deletePartidaPlantilla(plantilla.id, partida.id);
        publicar("linea_borrada", partida.id);
    }, [plantilla.id, partida, publicar]);

    const cancelar_ = useCallback(() => publicar("borrado_de_linea_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarPartidaPlantilla"
            abierto={true}
            titulo={t("plantilla_asiento.borrarPartida")}
            mensaje={t("plantilla_asiento.estaSeguroDeQueDeseaBorrar2", { numeroOrden: partida.numeroOrden })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
