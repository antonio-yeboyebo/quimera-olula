import { VentaTpv } from "#/tpv/venta/diseño.ts";
import { ModeloClienteFacturaRegistrado } from "#/ventas/factura/cliente_factura/cliente_factura.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { guardarClienteRegistrado, guardarClienteSimplificada } from "./cambiar_cliente.ts";
import "./CambiarClienteVentaTpv.css";
import { ClienteVentaTpv } from "./ClienteVentaTpv.tsx";

export const CambiarCliente = ({
    publicar = async() => {},
    venta,
}: {
    venta: VentaTpv;
    publicar?: EmitirEvento;
}) => {

    const cancelar = () => {
        publicar("cambio_cliente_cancelado");
    };

    const guardar = async(cliente: ModeloClienteFacturaRegistrado | null) => {

        if (cliente) {
            const registrado = cliente as ModeloClienteFacturaRegistrado
            await guardarClienteRegistrado(venta.id, registrado);
            publicar("cliente_cambiado", registrado);

        } else {
            await guardarClienteSimplificada(venta.id);
            publicar("cliente_cambiado", null);
        }
    }

    return (
        <ClienteVentaTpv
            venta={venta}
            guardar={guardar}
            cancelar={cancelar}
        />
    );
}

