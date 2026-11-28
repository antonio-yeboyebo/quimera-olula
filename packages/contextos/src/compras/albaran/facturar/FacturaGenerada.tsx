import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useNavigate } from "react-router";
import { useTCompras } from "#/compras/i18n/index.ts";
import { FacturaCreada } from "../../factura/diseño.ts";

export const FacturaGenerada = ({
    factura,
    publicar,
}: {
    factura: FacturaCreada;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const navigate = useNavigate();

    const cerrar = () => publicar("resultado_facturado_cerrado");

    return (
        <QModal
            nombre="facturaGeneradaCompra"
            abierto={true}
            titulo={t("albaran.facturar.generadaTitulo")}
            onCerrar={cerrar}
        >
            <div className="mensaje">
                {t("albaran.facturar.generada", { codigo: factura.codigo })}
            </div>
            <div className="botones">
                <QBoton onClick={() => navigate(`/compras/factura?id=${factura.id}`)}>
                    {t("albaran.facturar.irFactura", { codigo: factura.codigo })}
                </QBoton>
                <QBoton variante="texto" onClick={cerrar}>
                    {t("comun.botones.aceptar")}
                </QBoton>
            </div>
        </QModal>
    );
};
