import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { useTCompras } from "#/compras/i18n/index.ts";
import { Albaran } from "../diseño.ts";

export const FacturarAlbaran = ({
    albaran,
    publicar,
}: {
    albaran: Albaran;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const facturar_ = useCallback(
        async () => publicar("facturado_confirmado"),
        [publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("facturado_cancelado"),
        [publicar]
    );

    const [facturar, cancelar] = useForm(facturar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="facturarAlbaranCompra"
            abierto={true}
            titulo={t("albaran.facturar.titulo")}
            mensaje={t("albaran.facturar.mensaje", { codigo: albaran.codigo })}
            onCerrar={cancelar}
            onAceptar={facturar}
        />
    );
};
