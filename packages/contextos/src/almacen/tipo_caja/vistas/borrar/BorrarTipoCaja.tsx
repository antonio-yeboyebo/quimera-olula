import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { TipoCaja } from "../../diseño.js";
import { deleteTipoCaja } from "../../infraestructura.js";
import { useTAlmacen } from "../../../i18n/index.ts";

export const BorrarTipoCaja = ({
    publicar,
    tipoCaja,
}: {
    tipoCaja: TipoCaja;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const borrar_ = useCallback(
        async () => {
            await deleteTipoCaja(tipoCaja.id);
            publicar("tipo_caja_borrado", tipoCaja);
        },
        [publicar, tipoCaja]
    );

    const cancelar_ = useCallback(
        () => publicar("borrado_de_tipo_caja_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarTipoCaja"
            abierto={true}
            titulo={t("tipo_caja.borrarTipoDeCaja")}
            mensaje={t("tipo_caja.estaSeguroDeQueDeseaBorrar", { descripcion: tipoCaja.descripcion })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
