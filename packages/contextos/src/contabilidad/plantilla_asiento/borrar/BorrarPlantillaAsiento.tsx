import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { PlantillaAsiento } from "../diseño.ts";
import { deletePlantillaAsiento } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const BorrarPlantillaAsiento = ({
    publicar,
    plantilla,
}: {
    plantilla: PlantillaAsiento;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const borrar_ = useCallback(async () => {
        await deletePlantillaAsiento(plantilla.id);
        publicar("plantilla_borrada", plantilla);
    }, [publicar, plantilla]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarPlantillaAsiento"
            abierto={true}
            titulo={t("plantilla_asiento.borrarPlantillaDeAsiento")}
            mensaje={t("plantilla_asiento.estaSeguroDeQueDeseaBorrar", { id: plantilla.id })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
