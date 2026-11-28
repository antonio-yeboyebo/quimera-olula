import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useNavigate } from "react-router";
import { ResultadoAlbaranar } from "./diseño.ts";
import { useTCompras } from "#/compras/i18n/index.ts";

export const ResultadoAlbaranado = ({
    resultado,
    publicar,
}: {
    resultado: ResultadoAlbaranar;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const navigate = useNavigate();

    const cerrar = () => publicar("resultado_albaranado_cerrado");

    const { creados, fallidos } = resultado;

    return (
        <QModal
            nombre="resultadoAlbaranadoCompra"
            abierto={true}
            titulo={t("pedido.resultado.titulo")}
            onCerrar={cerrar}
        >
            <div className="mensaje">
                {creados.length === 0
                    ? t("pedido.resultado.ninguno")
                    : t("pedido.resultado.generados", { count: creados.length })}
            </div>
            {creados.length > 0 && (
                <ul>
                    {creados.map((albaran) => (
                        <li key={albaran.id}>
                            <QBoton
                                variante="texto"
                                onClick={() => navigate(`/compras/albaran?id=${albaran.id}`)}
                            >
                                {t("pedido.resultado.irAlbaran", { etiqueta: albaran.etiqueta, codigo: albaran.codigo })}
                            </QBoton>
                        </li>
                    ))}
                </ul>
            )}
            {fallidos.length > 0 && (
                <>
                    <div className="mensaje">{t("pedido.resultado.fallidos")}</div>
                    <ul>
                        {fallidos.map((fallo, indice) => (
                            <li key={indice}>{fallo}</li>
                        ))}
                    </ul>
                </>
            )}
            <div className="botones">
                <QBoton onClick={cerrar}>{t("comun.botones.aceptar")}</QBoton>
            </div>
        </QModal>
    );
};
