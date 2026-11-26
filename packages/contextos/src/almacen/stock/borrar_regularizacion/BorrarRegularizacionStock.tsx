import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { RegularizacionStock } from "../diseño.ts";
import { deleteRegularizacionStock } from "../infraestructura.ts";
import { useTAlmacen } from "../../i18n/index.ts";

export const BorrarRegularizacionStock = ({
    regularizacion,
    publicar,
}: {
    regularizacion: RegularizacionStock;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const borrar_ = useCallback(async () => {
        await deleteRegularizacionStock(regularizacion.id);
        publicar("regularizacion_borrada", regularizacion);
    }, [regularizacion, publicar]);

    const cancelar_ = useCallback(
        () => publicar("borrado_regularizacion_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarRegularizacionStock"
            abierto={true}
            titulo={t("stock.borrarRegularizacion")}
            mensaje={t("stock.borrarLaRegularizacionACantidadfinalDel", { cantidadFinal: regularizacion.cantidadFinal, fecha: regularizacion.fecha, hora: regularizacion.hora })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
