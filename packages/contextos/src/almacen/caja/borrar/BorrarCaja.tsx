import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Caja } from "../diseño.ts";
import { deleteCaja } from "../infraestructura.ts";
import { useTAlmacen } from "../../i18n/index.ts";

export const BorrarCaja = ({
    caja,
    publicar,
}: {
    caja: Caja;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const borrar_ = useCallback(
        async () => {
            await deleteCaja(caja.id);
            publicar("caja_borrada", caja);
        },
        [publicar, caja]
    );

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarCaja"
            abierto={true}
            titulo={t("caja.borrarCaja")}
            mensaje={t("caja.estaSeguroDeQueDeseaBorrar", { valor: caja.lpn || caja.id })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
