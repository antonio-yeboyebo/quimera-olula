import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { useTCompras } from "#/compras/i18n/index.ts";
import { CuentaBancoProveedor, Proveedor } from "../diseño.ts";
import { deleteCuentaBancoProveedor } from "../infraestructura.ts";

export const BorrarCuentaBancoProveedor = ({
    proveedor,
    cuenta,
    publicar,
}: {
    proveedor: Proveedor;
    cuenta: CuentaBancoProveedor;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const borrar_ = useCallback(async () => {
        await deleteCuentaBancoProveedor(proveedor.id, cuenta.id);
        publicar("cuenta_borrada", cuenta.id);
    }, [proveedor.id, cuenta.id, publicar]);

    const cancelar_ = useCallback(
        () => publicar("borrado_de_cuenta_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarCuentaBancoProveedor"
            abierto={true}
            titulo={t("proveedor.cuentas.borrarTitulo")}
            mensaje={t("proveedor.cuentas.borrarMensaje", { cuenta: cuenta.descripcion || cuenta.iban })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
