import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { LibroMayor } from "../diseño.ts";
import { etiquetaLibroMayor } from "../dominio.ts";
import { deleteLibroMayor } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const BorrarLibroMayor = ({
    publicar,
    informe,
}: {
    informe: LibroMayor;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const borrar_ = useCallback(async () => {
        await deleteLibroMayor(informe.id);
        publicar("informe_borrado", informe);
    }, [publicar, informe]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarLibroMayor"
            abierto={true}
            titulo={t("libro_mayor.borrarInforme")}
            mensaje={t("libro_mayor.confirmaBorrarInformeSoloSeBorra", { informe: etiquetaLibroMayor(informe) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
