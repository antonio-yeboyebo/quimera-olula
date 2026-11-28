import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { useTCompras } from "#/compras/i18n/index.ts";
import { DireccionProveedor, Proveedor } from "../diseño.ts";
import { direccionProveedorCompleta } from "../dominio.ts";
import { deleteDireccionProveedor } from "../infraestructura.ts";

export const BorrarDireccionProveedor = ({
    proveedor,
    direccion,
    publicar,
}: {
    proveedor: Proveedor;
    direccion: DireccionProveedor;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const borrar_ = useCallback(async () => {
        await deleteDireccionProveedor(proveedor.id, direccion.id);
        publicar("direccion_borrada", direccion.id);
    }, [proveedor.id, direccion.id, publicar]);

    const cancelar_ = useCallback(
        () => publicar("borrado_de_direccion_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarDireccionProveedor"
            abierto={true}
            titulo={t("proveedor.direcciones.borrarTitulo")}
            mensaje={t("proveedor.direcciones.borrarMensaje", { direccion: direccionProveedorCompleta(direccion) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
