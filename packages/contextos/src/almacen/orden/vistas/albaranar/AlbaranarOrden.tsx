import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { AlbaranGenerado, DiferenciaPedidoOrden, OrdenAlmacen } from "../../diseño.ts";
import { textoDiferenciaPedido } from "../../dominio.ts";
import { albaranarOrden, getDiferenciasPedidoOrden } from "../../infraestructura.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

export const AlbaranarOrden = ({
    publicar,
    orden,
}: {
    publicar: EmitirEvento;
    orden: OrdenAlmacen;
}) => {
    const t = useTAlmacen();
    const { intentar } = useContext(ContextoError);
    const [albaranes, setAlbaranes] = useState<AlbaranGenerado[] | null>(null);
    // null mientras se comprueba si la orden cuadra con el estado actual de sus pedidos.
    const [diferencias, setDiferencias] = useState<DiferenciaPedidoOrden[] | null>(null);

    useEffect(() => {
        let vigente = true;
        getDiferenciasPedidoOrden(orden.id)
            .then((d) => vigente && setDiferencias(d))
            // Si la comprobación falla no se impide albaranar: solo se pierde el aviso.
            .catch(() => vigente && setDiferencias([]));
        return () => { vigente = false; };
    }, [orden.id]);

    const albaranar = useCallback(async () => {
        await intentar(async () => {
            setAlbaranes(await albaranarOrden(orden.id));
        });
    }, [orden.id, intentar]);

    const cerrar = () => publicar("orden_albaranada");

    if (albaranes) {
        return (
            <QModal
                abierto={true}
                nombre="ordenAlbaranada"
                titulo={t("orden.ordenAlbaranada")}
                onCerrar={cerrar}
            >
                {albaranes.length === 0 ? (
                    <p>{t("orden.laOrdenSeHaTerminadoNo")}</p>
                ) : (
                    <>
                        <p>
                            {albaranes.length === 1
                                ? t("orden.seHaGeneradoElAlbaran")
                                : t("orden.seHanGeneradoLengthAlbaranes", { length: albaranes.length })}
                        </p>
                        <ul>
                            {albaranes.map(({ id, codigo }) => (
                                <li key={id}>
                                    <Link to={`/ventas/albaran?id=${id}`} onClick={cerrar}>
                                        {t("orden.albaranCodigo", { codigo })}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
                <div className="maestro-botones">
                    <QBoton onClick={cerrar}>{t("orden.cerrar")}</QBoton>
                </div>
            </QModal>
        );
    }

    return (
        <QModal
            abierto={true}
            nombre="confirmarAlbaranar"
            titulo={t("orden.albaranarOrdenDeSalida")}
            onCerrar={() => publicar("albaranado_cancelado")}
        >
            {diferencias === null ? (
                <p>{t("orden.comprobandoLaOrdenContraSusPedidos")}</p>
            ) : diferencias.length > 0 && (
                <QAviso variante="advertencia">
                    <p>
                        {t("orden.laOrdenNoCuadraConLo")}
                    </p>
                    <ul>
                        {diferencias.map((d) => (
                            <li key={`${d.lineaPedidoId}-${d.sku}`}>{textoDiferenciaPedido(d)}</li>
                        ))}
                    </ul>
                    <p>
                        {t("orden.siAlbaranaAhoraElAlbaranLlevara")}
                    </p>
                </QAviso>
            )}
            <p>
                {t("orden.seGeneraraUnAlbaranPorCada", { descripcion: orden.descripcion })}
            </p>
            <div className="maestro-botones">
                <QBoton variante="borde" onClick={() => publicar("albaranado_cancelado")}>{t("orden.cancelar")}</QBoton>
                <QBoton onClick={albaranar} deshabilitado={diferencias === null}>
                    {diferencias && diferencias.length > 0 ? t("orden.albaranarIgualmente") : t("orden.albaranar")}
                </QBoton>
            </div>
        </QModal>
    );
};
