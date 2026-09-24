import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { OrdenAlmacen } from "../../diseño.ts";
import { deleteOrden } from "../../infraestructura.ts";

export const BorrarOrden = ({
    publicar,
    orden,
}: {
    publicar: EmitirEvento;
    orden: OrdenAlmacen;
}) => {
    const borrar_ = useCallback(
        async () => {
            await deleteOrden(orden.id);
            publicar("orden_borrada", orden);
        },
        [publicar, orden]
    );

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="confirmarBorrarOrden"
            abierto={true}
            titulo="Confirmar borrado"
            mensaje={`La orden "${orden.tipo}" y sus líneas se borrarán de forma permanente`}
            onCerrar={cancelar}
            onAceptar={borrar}
            labelAceptar='Borrar orden'
            destructivo
        />
    );
};
