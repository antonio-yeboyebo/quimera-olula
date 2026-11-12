import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { EstadoLinea, ItemPedidoVenta, LineaPedidoVenta } from "../../diseño.ts";
import { ETIQUETA_POSICION, FilaCompetencia, filasCompetencia } from "../../dominio.ts";
import "./CompetidoresLinea.css";

const metaTablaCompetencia = (
    onAbrirPedido: (pedidoId: string) => void,
): MetaTabla<FilaCompetencia> => ({
    cols: [
        {
            id: "posicion",
            cabecera: "Prioridad",
            render: (f) => {
                const posicion = f.posicion === "propia" ? "Esta línea" : ETIQUETA_POSICION[f.posicion];
                return f.prioritaria ? `★ ${posicion}` : posicion;
            },
        },
        {
            id: "codigo",
            cabecera: "Pedido",
            render: (f) =>
                f.posicion === "propia" ? (
                    f.codigo
                ) : (
                    <QBoton variante="texto" tamaño="pequeño" onClick={() => onAbrirPedido(f.pedidoId)}>
                        {f.codigo}
                    </QBoton>
                ),
        },
        { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
        { id: "cliente", cabecera: "Cliente" },
        { id: "pendiente", cabecera: "Pendiente", tipo: "numero" },
        { id: "asignado", cabecera: "Asignado", tipo: "numero" },
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
            <h3>Pedidos que piden {linea.referencia}</h3>
            {estado.competidores.length === 0 ? (
                <p>Ningún otro pedido pendiente pide este artículo.</p>
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
