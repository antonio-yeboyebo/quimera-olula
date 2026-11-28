import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { PickingFijo } from "../diseño.ts";
import { deletePickingFijo } from "../infraestructura.ts";
import { useTAlmacen } from "../../i18n/index.ts";

export const BorrarPickingFijo = ({
    publicar,
    pickingFijo,
}: {
    pickingFijo: PickingFijo;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const borrar_ = useCallback(async () => {
        await deletePickingFijo(pickingFijo.id);
        publicar("picking_fijo_borrado", pickingFijo.id);
    }, [publicar, pickingFijo]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarPickingFijo"
            abierto={true}
            titulo={t("picking_fijo.borrarPickingFijo")}
            mensaje={t("picking_fijo.estaSeguroDeQueDeseaBorrar", { articuloId: pickingFijo.articuloId, ubicacion: pickingFijo.ubicacion })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
