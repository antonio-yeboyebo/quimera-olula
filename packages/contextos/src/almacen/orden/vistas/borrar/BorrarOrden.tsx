import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { OrdenAlmacen } from "../../diseño.ts";
import { deleteOrden } from "../../infraestructura.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

export const BorrarOrden = ({
    publicar,
    orden,
}: {
    publicar: EmitirEvento;
    orden: OrdenAlmacen;
}) => {
    const t = useTAlmacen();
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
            titulo={t("orden.confirmarBorrado")}
            mensaje={t("orden.laOrdenTipoYSusLineas", { tipo: orden.tipo })}
            onCerrar={cancelar}
            onAceptar={borrar}
            labelAceptar={t("orden.borrarOrden")}
            destructivo
        />
    );
};
