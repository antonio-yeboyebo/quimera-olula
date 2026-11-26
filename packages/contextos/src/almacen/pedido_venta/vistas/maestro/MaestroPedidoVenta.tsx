import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.tsx";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { ClausulaFiltro } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useLayout } from "@olula/lib/useLayout.js";
import { useEffect, useMemo } from "react";
import { DetallePedidoVenta } from "../../detalle/DetallePedidoVenta.tsx";
import { ItemPedidoVenta } from "../../diseño.ts";
import { ESTILO_DISPONIBILIDAD } from "../../dominio.ts";
import { GenerarSalidaPedidoVenta } from "../generar_salida/GenerarSalidaPedidoVenta.tsx";
import { SalidaGenerada } from "../salida_generada/SalidaGenerada.tsx";
import { ComprobarReservasPedidoVenta } from "../comprobar_reservas/ComprobarReservasPedidoVenta.tsx";
import { ContextoMaestroPedidoVenta } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { tAlmacen, useTAlmacen } from "../../../i18n/index.ts";

const metaTablaPedidoVenta: MetaTabla<ItemPedidoVenta> = [
    { id: "codigo", get cabecera() { return tAlmacen("pedido_venta.codigo"); } },
    { id: "fecha", get cabecera() { return tAlmacen("pedido_venta.fecha"); }, tipo: "fecha" },
    { id: "cliente", get cabecera() { return tAlmacen("pedido_venta.cliente"); } },
    {
        id: "disponibilidad",
        get cabecera() { return tAlmacen("pedido_venta.stock"); },
        render: (p: ItemPedidoVenta) => {
            if (!p.disponibilidad) return null;
            const { label, color } = ESTILO_DISPONIBILIDAD[p.disponibilidad];
            return <span style={{ color, fontWeight: 600 }}>{label}</span>;
        },
    },
];

const filtroPendientes: ClausulaFiltro[] = [
    ["servido", "in", ["No", "Parcial"] as unknown as string],
];

const metaFiltroPedidoVenta: MetaFiltro = {
    solo_pendientes: {
        id: "solo_pendientes",
        get label() { return tAlmacen("pedido_venta.soloPendientes"); },
        tipo: "checkbox",
        filtro: (v) => {
            const activo = v === true || v === "true" || v === "1";
            return activo
                ? ["servido", "in", ["No", "Parcial"] as unknown as string]
                : null;
        },
        fromFiltro: (filtro) =>
            filtro.some(([campo, op]) => campo === "servido" && op === "in"),
    },
};

export const MaestroPedidoVenta = () => {
    const t = useTAlmacen();
    const criteriaBase = useMemo(
        () => ({ ...criteriaDefecto, filtro: filtroPendientes }),
        []
    );

    const { layout, cambiarLayout } = useLayout("TABLA");

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        pedidos: listaActivaEntidadesInicial<ItemPedidoVenta>(id, criteriaInicial),
        seleccionadas: [],
        idOrdenCreada: "",
        zonas: [],
    } as ContextoMaestroPedidoVenta);

    useUrlParams(ctx.pedidos.activo, ctx.pedidos.criteria);

    useEffect(() => {
        emitir("recarga_de_pedidos_solicitada", ctx.pedidos.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { estado } = ctx;

    return (
        <div className="PedidoVenta">
            <MaestroDetalle<ItemPedidoVenta>
                Maestro={
                    <>
                        <h2>{t("pedido_venta.pedidosDeVenta")}</h2>
                        <div className="maestro-botones">
                            <span className="cambio-modo-icono" onClick={cambiarLayout}>
                                <QIcono
                                    nombre={layout === "TABLA" ? "lista" : "tabla"}
                                    tamaño="md"
                                />
                            </span>
                            <QBoton onClick={() => emitir("comprobar_reservas_solicitado")}>
                                {t("pedido_venta.comprobarDisponibilidad")}
                            </QBoton>
                        </div>
                        <Listado<ItemPedidoVenta>
                            metaTabla={metaTablaPedidoVenta}
                            metaFiltro={metaFiltroPedidoVenta}
                            criteria={ctx.pedidos.criteria}
                            modo={layout === "TARJETA" ? "tarjetas" : "tabla"}
                            tarjeta={TarjetaPedidoVenta}
                            entidades={ctx.pedidos.lista}
                            totalEntidades={ctx.pedidos.total}
                            seleccionada={ctx.pedidos.activo}
                            modoMultiseleccion={true}
                            onMultiSeleccion={(ids) => emitir("seleccionadas_cambiadas", ids)}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    {ctx.seleccionadas.length > 0 && (
                                        <QBoton onClick={() => emitir("generar_salida_solicitada")}>
                                            {t("pedido_venta.generarSalidaLength", { length: ctx.seleccionadas.length })}
                                        </QBoton>
                                    )}
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("pedido_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetallePedidoVenta id={ctx.pedidos.activo} zonas={ctx.zonas} publicar={emitir} />}
                seleccionada={ctx.pedidos.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "GENERANDO_SALIDA" && (
                <GenerarSalidaPedidoVenta
                    publicar={emitir}
                    pedidoIds={ctx.seleccionadas}
                />
            )}

            {estado === "SALIDA_GENERADA" && (
                <SalidaGenerada
                    publicar={emitir}
                    idOrden={ctx.idOrdenCreada}
                />
            )}

            {estado === "COMPROBANDO_RESERVAS" && (
                <ComprobarReservasPedidoVenta publicar={emitir} />
            )}
        </div>
    );
};

const TarjetaPedidoVenta = (pedido: ItemPedidoVenta) => {
    return (
        <div className="tarjeta-pedido-venta" key={pedido.id}>
            <div className="tarjeta-pedido-venta-codigo">{pedido.codigo}</div>
            <div className="tarjeta-pedido-venta-cliente">{pedido.cliente}</div>
        </div>
    );
};
