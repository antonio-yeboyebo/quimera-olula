import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Inventario, LineaInventario } from "../diseño.ts";
import { deleteLineaInventario } from "../infraestructura.ts";
import { useTAlmacen } from "../../i18n/index.ts";

export const BorrarLineaInventario = ({
    inventario,
    linea,
    publicar,
}: {
    inventario: Inventario;
    linea: LineaInventario;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const borrar_ = useCallback(async () => {
        await deleteLineaInventario(inventario.id, linea.id);
        publicar("linea_borrada", linea);
    }, [inventario.id, linea, publicar]);

    const cancelar_ = useCallback(
        () => publicar("borrado_de_linea_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarLineaInventario"
            abierto={true}
            titulo={t("inventario.borrarLineaDeInventario")}
            mensaje={t("inventario.borrarLaLineaDeArticuloidEl", { articuloId: linea.articuloId })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
