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

export const AlbaranarOrden = ({
    publicar,
    orden,
}: {
    publicar: EmitirEvento;
    orden: OrdenAlmacen;
}) => {
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
                titulo="Orden albaranada"
                onCerrar={cerrar}
            >
                {albaranes.length === 0 ? (
                    <p>La orden se ha terminado. No tenía líneas de pedido pendientes de albaranar.</p>
                ) : (
                    <>
                        <p>
                            {albaranes.length === 1
                                ? "Se ha generado el albarán:"
                                : `Se han generado ${albaranes.length} albaranes:`}
                        </p>
                        <ul>
                            {albaranes.map(({ id, codigo }) => (
                                <li key={id}>
                                    <Link to={`/ventas/albaran?id=${id}`} onClick={cerrar}>
                                        Albarán {codigo}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
                <div className="maestro-botones">
                    <QBoton onClick={cerrar}>Cerrar</QBoton>
                </div>
            </QModal>
        );
    }

    return (
        <QModal
            abierto={true}
            nombre="confirmarAlbaranar"
            titulo="Albaranar orden de salida"
            onCerrar={() => publicar("albaranado_cancelado")}
        >
            {diferencias === null ? (
                <p>Comprobando la orden contra sus pedidos…</p>
            ) : diferencias.length > 0 && (
                <QAviso variante="advertencia">
                    <p>
                        La orden no cuadra con lo que piden ahora sus pedidos. Puede que haya
                        cambios en el pedido que la orden no ha recogido:
                    </p>
                    <ul>
                        {diferencias.map((d) => (
                            <li key={`${d.lineaPedidoId}-${d.sku}`}>{textoDiferenciaPedido(d)}</li>
                        ))}
                    </ul>
                    <p>
                        Si albarana ahora, el albarán llevará lo recogido en la orden, no lo que
                        pide el pedido.
                    </p>
                </QAviso>
            )}
            <p>
                Se generará un albarán por cada pedido de la orden "{orden.descripcion}" y la orden
                quedará terminada. ¿Desea continuar?
            </p>
            <div className="maestro-botones">
                <QBoton variante="borde" onClick={() => publicar("albaranado_cancelado")}>Cancelar</QBoton>
                <QBoton onClick={albaranar} deshabilitado={diferencias === null}>
                    {diferencias && diferencias.length > 0 ? "Albaranar igualmente" : "Albaranar"}
                </QBoton>
            </div>
        </QModal>
    );
};
