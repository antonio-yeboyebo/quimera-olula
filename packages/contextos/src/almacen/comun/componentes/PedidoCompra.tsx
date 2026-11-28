import { getPedidos } from "#/almacen/pedido_compra/infraestructura.ts";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { tAlmacen } from "../../i18n/index.ts";


interface PedidoCompraProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  autoFocus?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const PedidoCompra = ({
  descripcion = "",
  valor,
  nombre = "pedido_compra_id",
  label = tAlmacen("comun.pedidoDeCompra"),
  onChange,
  ...props
}: PedidoCompraProps) => {

    const obtenerOpciones = async (texto: string) => {
        const filtro: Filtro = { or: [
            ["codigo", "~", texto],
            ["proveedor", "~", texto],
        ] };
        const orden: Orden = ["codigo"];

        const respuesta = await getPedidos(filtro, orden);

        return respuesta.datos.map((pedido) => ({
            valor: pedido.id,
            descripcion: pedido.codigo,
            descripcionOpcion: `${pedido.codigo} - ${pedido.fecha.toLocaleDateString("es-ES")} - ${pedido.proveedor}`,
            datos: pedido,
        }));
    };

    return (
        <QAutocompletar
            label={`${label} ${valor}`}
            nombre={nombre}
            onChange={onChange}
            valor={valor}
            obtenerOpciones={obtenerOpciones}
            descripcion={descripcion}
            {...props}
        />
    );
};
