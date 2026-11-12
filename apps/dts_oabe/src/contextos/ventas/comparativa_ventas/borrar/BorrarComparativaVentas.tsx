import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { ComparativaVentas } from "../diseño.ts";
import { etiquetaComparativaVentas } from "../dominio.ts";
import { deleteComparativaVentas } from "../infraestructura.ts";

export const BorrarComparativaVentas = ({
    publicar,
    comparativa,
}: {
    comparativa: ComparativaVentas;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteComparativaVentas(comparativa.id);
        publicar("comparativa_borrada", comparativa);
    }, [publicar, comparativa]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarComparativaVentas"
            abierto={true}
            titulo="Borrar comparativa"
            mensaje={`¿Confirma borrar ${etiquetaComparativaVentas(comparativa)}? Solo se borran los criterios guardados.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
