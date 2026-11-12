import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { formatearFechaDate } from "@olula/lib/dominio.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useEffect } from "react";
import { ItemPedidoVenta } from "../diseño.ts";
import { hayLineasPrioritarias, prioridadDisponible } from "../dominio.ts";
import { contextoDetallePedidoVentaInicial } from "./detalle.ts";
import "./DetallePedidoVenta.css";
import { getMaquina } from "./maquina.ts";
import { PedidoCompetidor } from "../vistas/pedido_competidor/PedidoCompetidor.tsx";
import { CompetidoresLinea } from "./competidores/CompetidoresLinea.tsx";
import { TabLineas } from "./TabLineas.tsx";

export const DetallePedidoVenta = ({
    id,
    zonas = [],
    publicar = async () => {},
}: {
    id?: string;
    zonas?: number[];
    publicar?: EmitirEvento;
}) => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetallePedidoVentaInicial, publicar);

    const claveZonas = zonas.join(",");

    useEffect(() => {
        emitir("pedido_id_cambiado", { id, zonas }, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, claveZonas]);

    if (!ctx.pedido.id) return null;

    const lineaActiva = ctx.pedido.lineas.find((l) => l.id === ctx.lineaActiva) ?? null;
    const estadoLineaActiva = lineaActiva ? ctx.estadoLineas[lineaActiva.id] : undefined;

    const titulo = (p: ItemPedidoVenta) => `${p.codigo} — ${p.cliente}`;

    const conPrioridad = prioridadDisponible();
    const acciones = conPrioridad
        ? [
            { texto: "Priorizar pedido", onClick: () => emitir("prioridad_pedido_solicitada", true) },
            {
                texto: "Quitar prioridad al pedido",
                onClick: () => emitir("prioridad_pedido_solicitada", false),
                deshabilitado: !hayLineasPrioritarias(ctx.pedido),
            },
        ]
        : [];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.pedido}
            cerrarDetalle={() => emitir("pedido_deseleccionado", null, true)}
        >
            <div className="DetallePedidoVenta">
                {acciones.length > 0 && <QuimeraAcciones acciones={acciones} vertical />}
                <quimera-formulario>
                    <QInput label="Código" nombre="codigo" valor={ctx.pedido.codigo} soloLectura />
                    <QInput label="Fecha" nombre="fecha" valor={formatearFechaDate(ctx.pedido.fecha)} soloLectura />
                    <QInput label="Cliente" nombre="cliente" valor={ctx.pedido.cliente} soloLectura />
                    {ctx.pedido.observaciones && (
                        <QInput label="Observaciones" nombre="observaciones" valor={ctx.pedido.observaciones} soloLectura />
                    )}
                </quimera-formulario>

                <Tabs children={[
                    <Tab
                        label="Líneas"
                        key="tab-lineas"
                        children={
                            <>
                                {zonas.length === 0 && (
                                    <p className="aviso-disponibilidad">
                                        Comprueba disponibilidad en el listado para ver el estado de las líneas.
                                    </p>
                                )}
                                <TabLineas
                                    lineas={ctx.pedido.lineas}
                                    estados={ctx.estadoLineas}
                                    lineaActiva={lineaActiva}
                                    onSeleccion={(linea) => emitir("linea_seleccionada", linea.id)}
                                    onCambiarPrioridad={
                                        conPrioridad
                                            ? (linea) => emitir("prioridad_linea_solicitada", linea.id)
                                            : undefined
                                    }
                                />
                                {lineaActiva && estadoLineaActiva && (
                                    <CompetidoresLinea
                                        pedido={ctx.pedido}
                                        linea={lineaActiva}
                                        estado={estadoLineaActiva}
                                        onAbrirPedido={(pedidoId) => emitir("pedido_competidor_solicitado", pedidoId)}
                                    />
                                )}
                            </>
                        }
                    />,
                ]} />
            </div>

            {ctx.estado === "VIENDO_PEDIDO_COMPETIDOR" && ctx.pedidoCompetidor && (
                <PedidoCompetidor pedidoCompetidor={ctx.pedidoCompetidor} publicar={emitir} />
            )}
        </Detalle>
    );
};
