import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { useContext } from "react";
import { useNavigate } from "react-router";
import { PedidoCreado } from "../diseño.ts";
import { useTVentas } from "../../i18n/index.ts";

type UrlPorId = (id: string) => string;

export const PedidoGenerado = ({
    publicar,
    pedido,
}: {
    publicar: EmitirEvento;
    pedido: PedidoCreado;
}) => {
    const t = useTVentas();
    const navigate = useNavigate();
    const { app } = useContext(FactoryCtx);
    const urlPedido =
        (app.Ventas?.presupuesto_url_pedido as UrlPorId | undefined) ??
        ((id: string) => `/ventas/pedido?id=${id}`);

    const cerrar = () => publicar("pedido_creado_cerrado");

    return (
        <QModal
            nombre="pedidoGenerado"
            abierto={true}
            titulo={t("presupuesto.aprobar.pedidoGenerado")}
            onCerrar={cerrar}
        >
            <div className="mensaje" style={{ whiteSpace: "pre-line" }}>
                {t("presupuesto.aprobar.pedidoGeneradoOk")}
            </div>
            <div className="botones">
                <QBoton variante="texto" onClick={cerrar}>
                    {t("presupuesto.aprobar.seguirEnPresupuesto")}
                </QBoton>
                <QBoton onClick={() => navigate(urlPedido(pedido.id))}>
                    {t("presupuesto.aprobar.irAlPedido", { codigo: pedido.codigo })}
                </QBoton>
            </div>
        </QModal>
    );
};
