import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { useTCompras } from "#/compras/i18n/index.ts";
import { Albaran } from "../diseño.ts";
import { deleteAlbaran } from "../infraestructura.ts";

export const BorrarAlbaran = ({
    albaran,
    publicar,
}: {
    albaran: Albaran;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const borrar_ = useCallback(async () => {
        await deleteAlbaran(albaran.id);
        publicar("albaran_borrado", albaran.id);
    }, [albaran, publicar]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarAlbaranCompra"
            abierto={true}
            titulo={t("albaran.borrar.titulo")}
            mensaje={t("albaran.borrar.mensaje", { codigo: albaran.codigo })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
