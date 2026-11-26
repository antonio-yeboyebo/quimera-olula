import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { ArticuloTarifa } from "../diseño.js";
import { descripcionArticuloTarifa } from "../dominio.js";
import { deleteArticuloTarifa } from "../infraestructura.js";
import { useTVentas } from "../../i18n/index.ts";

export const BorrarArticuloTarifa = ({
    articulo,
    publicar,
}: {
    articulo: ArticuloTarifa;
    publicar: EmitirEvento;
}) => {
    const t = useTVentas();
    const borrar_ = useCallback(
        async () => {
            await deleteArticuloTarifa(articulo.id);
            publicar("articulo_borrado", articulo.id);
        },
        [articulo, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("borrado_de_articulo_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="confirmarBorrarArticuloTarifa"
            abierto={true}
            titulo={t("tarifa.articulos.quitarTitulo")}
            mensaje={t("tarifa.articulos.quitarMensaje", { articulo: descripcionArticuloTarifa(articulo) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
