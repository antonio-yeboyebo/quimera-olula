import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { EstadoLinea, ItemPedidoVenta, LineaPedidoVenta } from "../../diseño.ts";
import { ETIQUETA_POSICION, FilaCompetencia, filasCompetencia } from "../../dominio.ts";
import "./CompetidoresLinea.css";
import { tAlmacen } from "../../../i18n/index.ts";

const metaTablaCompetencia = (
    onAbrirPedido: (pedidoId: string) => void,
): MetaTabla<FilaCompetencia> => ({
    cols: [
        {
            id: "posicion",
            cabecera: tAlmacen("pedido_venta.prioridad"),
            render: (f) => {
                const posicion = f.posicion === "propia" ? tAlmacen("pedido_venta.estaLinea") : ETIQUETA_POSICION[f.posicion];
                return f.prioritaria ? `★ ${posicion}` : posicion;
            },
        },
        {
            id: "codigo",
            cabecera: tAlmacen("pedido_venta.pedido"),
            render: (f) =>
                f.posicion === "propia" ? (
                    f.codigo
                ) : (
                    <QBoton variante="texto" tamaño="pequeño" onClick={() => onAbrirPedido(f.pedidoId)}>
                        {f.codigo}
                    </QBoton>
                ),
        },
        { id: "fecha", cabecera: tAlmacen("pedido_venta.fecha"), tipo: "fecha" },
        { id: "cliente", cabecera: tAlmacen("pedido_venta.cliente") },
        { id: "pendiente", cabecera: tAlmacen("pedido_venta.pendiente"), tipo: "numero" },
        { id: "asignado", cabecera: tAlmacen("pedido_venta.asignado"), tipo: "numero" },
    ],
});

export const CompetidoresLinea = ({
    pedido,
    linea,
    estado,
    onAbrirPedido,
}: {
    pedido: ItemPedidoVenta;
    linea: LineaPedidoVenta;
    estado: EstadoLinea;
    onAbrirPedido: (pedidoId: string) => void;
}) => {
    const filas = filasCompetencia(pedido, estado);
    const propia = filas.find((f) => f.posicion === "propia") ?? null;

    return (
        <section className="CompetidoresLinea">
            <h3>{tAlmacen("pedido_venta.pedidosQuePidenReferencia", { referencia: linea.referencia })}</h3>
            {estado.competidores.length === 0 ? (
                <p>{tAlmacen("pedido_venta.ningunOtroPedidoPendientePideEste")}</p>
            ) : (
                <ListadoSemiControlado
                    metaTabla={metaTablaCompetencia(onAbrirPedido)}
                    entidades={filas}
                    totalEntidades={filas.length}
                    cargando={false}
                    seleccionada={propia}
                    onSeleccion={() => {}}
                    criteriaInicial={criteriaDefecto}
                    onCriteriaChanged={() => null}
                    modo="tabla"
                />
            )}
        </section>
    );
};
