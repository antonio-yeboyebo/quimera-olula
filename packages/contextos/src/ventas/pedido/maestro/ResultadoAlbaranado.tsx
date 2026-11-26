import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { useContext } from "react";
import { useNavigate } from "react-router";
import { AlbaranGenerado } from "../diseño.ts";
import { useTVentas } from "../../i18n/index.ts";

type UrlPorId = (id: string) => string;

export const ResultadoAlbaranado = ({
    publicar,
    creados,
    fallidos,
}: {
    publicar: EmitirEvento;
    creados: AlbaranGenerado[];
    fallidos: string[];
}) => {
    const t = useTVentas();
    const navigate = useNavigate();
    const { app } = useContext(FactoryCtx);
    const urlAlbaran =
        (app.Ventas?.albaranar_url_albaran as UrlPorId | undefined) ??
        ((id: string) => `/ventas/albaran?id=${id}`);

    const cerrar = () => publicar("resultado_albaranado_cerrado");

    return (
        <QModal
            nombre="resultadoAlbaranado"
            abierto={true}
            titulo={t("pedido.albaranarVarios.resultado")}
            onCerrar={cerrar}
        >
            <div className="mensaje">
                {creados.length === 0
                    ? t("pedido.albaranarVarios.ninguno")
                    : t("pedido.albaranarVarios.generados", { count: creados.length })}
            </div>
            {creados.length > 0 && (
                <ul>
                    {creados.map((albaran) => (
                        <li key={albaran.id}>
                            <QBoton
                                variante="texto"
                                onClick={() => navigate(urlAlbaran(albaran.id))}
                            >
                                {t("pedido.albaranarVarios.irAlAlbaran", { etiqueta: albaran.etiqueta, codigo: albaran.codigo })}
                            </QBoton>
                        </li>
                    ))}
                </ul>
            )}
            {fallidos.length > 0 && (
                <>
                    <div className="mensaje">{t("pedido.albaranarVarios.fallidos")}</div>
                    <ul>
                        {fallidos.map((fallo, indice) => (
                            <li key={indice}>{fallo}</li>
                        ))}
                    </ul>
                </>
            )}
            <div className="botones">
                <QBoton onClick={cerrar}>{t("pedido.albaranarVarios.aceptar")}</QBoton>
            </div>
        </QModal>
    );
};
