import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { CajaProveedorArticulo } from "../diseño.ts";
import { deleteCajaProveedor } from "../infraestructura.ts";
import { useTAlmacen } from "../../i18n/index.ts";

export const BorrarCajaProveedor = ({
    articuloId,
    proveedorId,
    caja,
    publicar,
}: {
    articuloId: string;
    proveedorId: string;
    caja: CajaProveedorArticulo;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const borrar_ = useCallback(async () => {
        await deleteCajaProveedor(articuloId, proveedorId, caja.id);
        publicar("caja_proveedor_borrada");
    }, [articuloId, proveedorId, caja.id, publicar]);

    const cancelar_ = useCallback(() => {
        publicar("borrado_de_caja_proveedor_cancelado");
    }, [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="confirmarBorrarCajaProveedor"
            abierto={true}
            titulo={t("articulo.confirmarBorrado")}
            mensaje={t("articulo.estaSeguroDeQueDeseaBorrar2", { tipoCaja: caja.tipoCaja })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
