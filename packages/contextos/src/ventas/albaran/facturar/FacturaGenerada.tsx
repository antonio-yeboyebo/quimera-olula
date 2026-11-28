import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { useContext } from "react";
import { useNavigate } from "react-router";
import { FacturaCreada } from "../diseño.ts";
import { useTVentas } from "../../i18n/index.ts";

type UrlPorId = (id: string) => string;

export const FacturaGenerada = ({
    publicar,
    factura,
}: {
    publicar: EmitirEvento;
    factura: FacturaCreada;
}) => {
    const t = useTVentas();
    const navigate = useNavigate();
    const { app } = useContext(FactoryCtx);
    const urlFactura =
        (app.Ventas?.albaran_url_factura as UrlPorId | undefined) ??
        ((id: string) => `/ventas/factura?id=${id}`);

    const cerrar = () => publicar("factura_creada_cerrada");

    return (
        <QModal
            nombre="facturaGenerada"
            abierto={true}
            titulo={t("albaran.facturar.facturaGenerada")}
            onCerrar={cerrar}
        >
            <div className="mensaje" style={{ whiteSpace: "pre-line" }}>
                {t("albaran.facturar.facturaGeneradaOk")}
            </div>
            <div className="botones">
                <QBoton variante="texto" onClick={cerrar}>
                    {t("albaran.facturar.seguirEnAlbaran")}
                </QBoton>
                <QBoton onClick={() => navigate(urlFactura(factura.id))}>
                    {t("albaran.facturar.irALaFactura", { codigo: factura.codigo })}
                </QBoton>
            </div>
        </QModal>
    );
};
