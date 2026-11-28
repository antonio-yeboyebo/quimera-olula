import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { IaFlujo } from "../diseño.js";
import { deleteIaFlujo } from "../infraestructura.js";
import { useTComun } from "../../i18n/index.ts";

export const BorrarIaFlujo = ({
    publicar,
    iaFlujo,
}: {
    iaFlujo: IaFlujo;
    publicar: EmitirEvento;
}) => {
    const t = useTComun();
    const borrar_ = useCallback(
        async () => {
            await deleteIaFlujo(iaFlujo.id);
            publicar("ia_flujo_borrado", iaFlujo);
        },
        [publicar, iaFlujo]
    );

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarIaFlujo"
            abierto={true}
            titulo={t("iaFlujo.borrarFlujoDeTrabajo")}
            mensaje={t("iaFlujo.estaSeguroDeQueDeseaBorrar", { nombre: iaFlujo.nombre })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
