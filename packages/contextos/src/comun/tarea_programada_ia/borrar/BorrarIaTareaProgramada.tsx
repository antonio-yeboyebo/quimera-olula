import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { IaTareaProgramada } from "../diseño.js";
import { deleteIaTareaProgramada } from "../infraestructura.js";
import { useTComun } from "../../i18n/index.ts";

export const BorrarIaTareaProgramada = ({
    publicar,
    tarea,
}: {
    tarea: IaTareaProgramada;
    publicar: EmitirEvento;
}) => {
    const t = useTComun();
    const borrar_ = useCallback(
        async () => {
            await deleteIaTareaProgramada(tarea.id);
            publicar("tarea_programada_ia_borrada", tarea);
        },
        [publicar, tarea]
    );

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarIaTareaProgramada"
            abierto={true}
            titulo={t("tareaProgramadaIa.borrarTareaProgramada")}
            mensaje={t("tareaProgramadaIa.estaSeguroDeQueDeseaBorrar", { nombre: tarea.nombre })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
