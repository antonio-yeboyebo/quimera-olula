import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Inventario } from "../diseño.ts";
import { deleteInventario } from "../infraestructura.ts";
import { useTAlmacen } from "../../i18n/index.ts";

export const BorrarInventario = ({
    inventario,
    publicar,
}: {
    inventario: Inventario;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const borrar_ = useCallback(async () => {
        await deleteInventario(inventario.id);
        publicar("inventario_borrado", inventario);
    }, [inventario, publicar]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarInventario"
            abierto={true}
            titulo={t("inventario.borrarInventario")}
            mensaje={t("inventario.borrarElInventarioIdSeBorraran", { id: inventario.id })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
