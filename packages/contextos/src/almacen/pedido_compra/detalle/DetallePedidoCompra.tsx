import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useEffect } from "react";
import { ItemPedidoCompra } from "../diseño.ts";
import { contextoDetallePedidoCompraInicial } from "./detalle.ts";
import "./DetallePedidoCompra.css";
import { getMaquina } from "./maquina.ts";
import { TabLineas } from "./TabLineas.tsx";
import { EntradaCreada } from "../vistas/entrada_creada/EntradaCreada.tsx";
import { ComparativaAlbaran } from "../vistas/leer_albaran/ComparativaAlbaran.tsx";
import { LeerAlbaran } from "../vistas/leer_albaran/LeerAlbaran.tsx";

/**
 * Componente detalle de solo lectura para pedidos de compra.
 *
 * Recibe el ID como prop (string | undefined), no la entidad completa.
 * La máquina carga el pedido cuando cambia el ID.
 *
 * No incluye formularios de edición, modales de borrado ni botones de acción.
 */
export const DetallePedidoCompra = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetallePedidoCompraInicial, publicar);

    // Recargar cuando el ID cambia (o se deselecciona con undefined)
    useEffect(() => {
        emitir("pedido_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.pedido.id) return null;

    const titulo = (p: ItemPedidoCompra) => `${p.codigo} — ${p.proveedor}`;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.pedido}
            cerrarDetalle={() => emitir("pedido_deseleccionado", null, true)}
        >
            <div className="DetallePedidoCompra">
                <dl>
                    <dt>Código</dt>
                    <dd>{ctx.pedido.codigo}</dd>
                    <dt>Proveedor</dt>
                    <dd>{ctx.pedido.proveedor}</dd>
                    <dt>Fecha</dt>
                    <dd>{ctx.pedido.fecha.toLocaleDateString()}</dd>
                </dl>

                <div className="botones maestro-botones">
                    <QBoton onClick={() => emitir("crear_entrada_solicitado")}>
                        Crear entrada
                    </QBoton>
                    <QBoton onClick={() => emitir("leer_albaran_solicitado")}>
                        Leer albarán
                    </QBoton>
                </div>

                <Tabs children={[
                    <Tab
                        label="Líneas"
                        key="tab-lineas"
                        children={
                            <TabLineas lineas={ctx.pedido.lineas} />
                        }
                    />,
                ]} />
            </div>

            {ctx.estado === "LEYENDO_ALBARAN" && (
                <LeerAlbaran
                    publicar={emitir}
                    pedidoCompraId={ctx.pedido.id}
                />
            )}
            {ctx.estado === "COMPARANDO_ALBARAN" && (
                <ComparativaAlbaran
                    publicar={emitir}
                    pedidoCompraId={ctx.pedido.id}
                    lineasPedido={ctx.pedido.lineas}
                    lineasDetectadas={ctx.lineasDetectadas}
                />
            )}
            {ctx.estado === "ENTRADA_CREADA" && (
                <EntradaCreada
                    publicar={emitir}
                    idOrden={ctx.idOrdenCreada}
                />
            )}
        </Detalle>
    );
};
