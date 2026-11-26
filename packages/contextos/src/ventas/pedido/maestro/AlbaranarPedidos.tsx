import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { GrupoAlbaranar } from "./maestro.ts";
import { tVentas, useTVentas } from "../../i18n/index.ts";

const lineasPorCliente = (grupos: GrupoAlbaranar[]): string[] => {
    const porEtiqueta = new Map<string, { pedidos: number; albaranes: number }>();

    grupos.forEach((grupo) => {
        const previo = porEtiqueta.get(grupo.etiqueta) ?? { pedidos: 0, albaranes: 0 };
        porEtiqueta.set(grupo.etiqueta, {
            pedidos: previo.pedidos + grupo.ids.length,
            albaranes: previo.albaranes + 1,
        });
    });

    return [...porEtiqueta.entries()].map(([etiqueta, { pedidos, albaranes }]) => {
        const cuantos = tVentas("pedido.albaranarVarios.pedidos", { count: pedidos });
        const reparto = albaranes > 1 ? tVentas("pedido.albaranarVarios.enAlbaranes", { count: albaranes }) : "";
        return `· ${etiqueta} — ${cuantos}${reparto}`;
    });
};

export const AlbaranarPedidos = ({
    publicar,
    pedidos,
    grupos,
}: {
    publicar: EmitirEvento;
    pedidos: number;
    grupos: GrupoAlbaranar[];
}) => {
    const t = useTVentas();
    const albaranar_ = useCallback(async () => {
        publicar("pedidos_albaranados");
    }, [publicar]);

    const cancelar_ = useCallback(
        () => publicar("albaranado_multiple_cancelado"),
        [publicar]
    );

    const [albaranar, cancelar] = useForm(albaranar_, cancelar_);

    const cabecera = grupos.length === 1
        ? t("pedido.albaranarVarios.cabeceraUno", { count: pedidos })
        : t("pedido.albaranarVarios.cabeceraVarios", { count: pedidos, albaranes: grupos.length });

    return (
        <QModalConfirmacion
            nombre="albaranarPedidos"
            abierto={true}
            titulo={t("pedido.albaranarVarios.titulo")}
            mensaje={[cabecera, "", ...lineasPorCliente(grupos)].join("\n")}
            onCerrar={cancelar}
            onAceptar={albaranar}
        />
    );
};
