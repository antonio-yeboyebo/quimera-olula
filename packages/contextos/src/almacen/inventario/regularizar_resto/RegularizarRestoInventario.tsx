import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Inventario } from "../diseño.ts";
import { patchRegularizarRestoInventario } from "../infraestructura.ts";
import { useTAlmacen } from "../../i18n/index.ts";

/**
 * Regulariza a 0 los artículos con stock en el almacén que no tienen línea
 * en el inventario (Eneboo: "¿Desea regularizarlos con cantidad 0?").
 */
export const RegularizarRestoInventario = ({
    inventario,
    publicar,
}: {
    inventario: Inventario;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const regularizar_ = useCallback(async () => {
        const lineas = await patchRegularizarRestoInventario(inventario.id);
        publicar("resto_regularizado", lineas);
    }, [inventario.id, publicar]);

    const cancelar_ = useCallback(
        () => publicar("regularizacion_resto_cancelada"),
        [publicar]
    );

    const [regularizar, cancelar] = useForm(regularizar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="regularizarRestoInventario"
            abierto={true}
            titulo={t("inventario.regularizarRestoA0")}
            mensaje={t("inventario.losArticulosDelAlmacenAlmacenidSin", { almacenId: inventario.almacenId })}
            onCerrar={cancelar}
            onAceptar={regularizar}
        />
    );
};
