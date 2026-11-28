import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { DetallePedidoCompra } from "../detalle/DetallePedidoCompra.js";
import { ItemPedidoCompra } from "../diseño.ts";
import "./MaestroConDetallePedidoCompra.css";
import { getMaquina } from "./maquina.ts";
import { tAlmacen, useTAlmacen } from "../../i18n/index.ts";

/**
 * Metadatos para renderizar la tabla de pedidos de compra.
 */
const metaTablaPedidoCompra: MetaTabla<ItemPedidoCompra> = [
    { id: "codigo", get cabecera() { return tAlmacen("pedido_compra.codigo"); } },
    { id: "proveedor", get cabecera() { return tAlmacen("pedido_compra.proveedor"); } },
    { id: "fecha", get cabecera() { return tAlmacen("pedido_compra.fecha"); }, tipo: "fecha" },
];

/**
 * Componente principal: listado (maestro) + detalle de solo lectura.
 *
 * Patrones aplicados:
 *   - useUrlParams     → escribe activo y criteria en la URL al cambiar
 *   - getUrlParams     → lee el estado inicial desde la URL (deep link)
 *   - listaActivaEntidadesInicial → inicializa con ID y criteria de la URL
 *
 * Solo lectura: no hay botón de crear ni modales de edición/borrado.
 */
export const MaestroConDetallePedidoCompra = () => {
    const t = useTAlmacen();
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        pedidos: listaActivaEntidadesInicial<ItemPedidoCompra>(id, criteriaInicial),
    });

    const { pedidos } = ctx;

    useUrlParams(pedidos.activo, pedidos.criteria);

    useEffect(() => {
        emitir("recarga_de_pedidos_solicitada", pedidos.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="PedidoCompra">
            <MaestroDetalle<ItemPedidoCompra>
                Maestro={
                    <>
                        <h2>{t("pedido_compra.pedidosDeCompra")}</h2>
                        <Listado<ItemPedidoCompra>
                            metaTabla={metaTablaPedidoCompra}
                            criteria={pedidos.criteria}
                            modoInicial="tarjetas"
                            tarjeta={TarjetaPedidoCompra}
                            entidades={pedidos.lista}
                            totalEntidades={pedidos.total}
                            seleccionada={pedidos.activo}
                            onSeleccion={(payload) => emitir("pedido_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetallePedidoCompra id={pedidos.activo} publicar={emitir} />}
                seleccionada={pedidos.activo}
                modoDisposicion="maestro-50"
            />
        </div>
    );
};

/**
 * Componente tarjeta para la vista de lista en modo tarjetas.
 * Se define fuera del componente principal para evitar re-renders.
 */
const TarjetaPedidoCompra = (pedido: ItemPedidoCompra) => {
    return (
        <div className="tarjeta-pedido-compra" key={pedido.id}>
            <div className="tarjeta-pedido-compra-cabecera">
                <div className="tarjeta-pedido-compra-codigo">{pedido.codigo}</div>
                <div className="tarjeta-pedido-compra-fecha">
                    {pedido.fecha.toLocaleDateString("es-ES")}
                </div>
            </div>
            <div className="tarjeta-pedido-compra-proveedor">{pedido.proveedor}</div>
        </div>
    );
};
