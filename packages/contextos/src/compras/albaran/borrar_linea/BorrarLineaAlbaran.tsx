import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { Albaran, LineaAlbaran } from "../diseño.ts";
import { etiquetaLinea, lineaDePedido } from "../dominio.ts";
import { borrarLineasAlbaran } from "../infraestructura.ts";
import { useTCompras } from "#/compras/i18n/index.ts";

export const BorrarLineaAlbaran = ({
    albaran,
    linea,
    publicar,
}: {
    albaran: Albaran;
    linea: LineaAlbaran;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const borrar_ = useCallback(async () => {
        await borrarLineasAlbaran(albaran.id, [linea.id]);
        publicar("linea_borrada", linea.id);
    }, [albaran.id, linea.id, publicar]);

    const cancelar_ = useCallback(
        () => publicar("borrado_de_linea_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    const aviso = lineaDePedido(linea)
        ? t("albaran.borrar.avisoLineaPedido")
        : "";

    return (
        <QModalConfirmacion
            nombre="borrarLineaAlbaranCompra"
            abierto={true}
            titulo={t("comun.lineas.borrar")}
            mensaje={`${t("comun.lineas.borrarMensaje", { linea: etiquetaLinea(linea) })}${aviso}`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
