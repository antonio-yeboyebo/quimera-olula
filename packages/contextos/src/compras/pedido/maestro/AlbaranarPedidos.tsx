import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { GrupoAlbaranar } from "./maestro.ts";
import { tCompras, useTCompras } from "#/compras/i18n/index.ts";

const lineasPorProveedor = (grupos: GrupoAlbaranar[], t = tCompras): string[] =>
    grupos.map((grupo) => t("pedido.albaranar.grupo", { etiqueta: grupo.etiqueta, count: grupo.ids.length }));

export const AlbaranarPedidos = ({
    pedidos,
    grupos,
    publicar,
}: {
    pedidos: number;
    grupos: GrupoAlbaranar[];
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const albaranar_ = useCallback(
        async () => publicar("albaranado_confirmado"),
        [publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("albaranado_cancelado"),
        [publicar]
    );

    const [albaranar, cancelar] = useForm(albaranar_, cancelar_);

    const cabecera = `${t("pedido.albaranar.cabecera", { pedidos })} ${t("pedido.albaranar.generara", { count: grupos.length })}`;

    return (
        <QModalConfirmacion
            nombre="albaranarPedidosCompra"
            abierto={true}
            titulo={t("pedido.albaranar.titulo")}
            mensaje={[cabecera, "", ...lineasPorProveedor(grupos, t)].join("\n")}
            onCerrar={cancelar}
            onAceptar={albaranar}
        />
    );
};
