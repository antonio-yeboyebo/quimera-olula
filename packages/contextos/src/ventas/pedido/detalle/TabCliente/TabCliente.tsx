import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { formatearDireccionVenta } from "#/ventas/comun/dominio.ts";
import { CambioClienteVenta } from "#/ventas/comun/componentes/moleculas/CambioClienteVenta/CambioClienteVenta.tsx";
import { CambioCliente } from "#/ventas/comun/componentes/moleculas/CambioClienteVenta/diseño.ts";
import { BotonCambiar } from "#/ventas/comun/componentes/BotonCambiar.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Pedido } from "../../diseño.ts";
import { EstadoPedido } from "../diseño.ts";
import { pedidoPendiente } from "../../dominio.ts";
import { editable } from "../detalle.ts";
import "./TabCliente.css";
import { useTVentas } from "../../../i18n/index.ts";

interface TabClienteProps {
  pedido: HookModelo<Pedido>;
  estado: EstadoPedido;
  publicar?: (evento: string, payload?: unknown) => void;
}

export const TabCliente = ({
  pedido,
  estado,
  publicar = async () => {},
}: TabClienteProps) => {
  const t = useTVentas();
  const { modelo } = pedido;
  const clienteEditable = editable(modelo) && pedidoPendiente(modelo);

  const onGuardarCambioCliente = async (cambios: CambioCliente) => {
    publicar("cambio_cliente_listo", cambios);
  };

  return (
    <div className="TabCliente">
      <quimera-formulario>
        <Cliente
          nombre="cliente_id"
          valor={modelo.cliente.cliente_id ?? ""}
          descripcion={modelo.cliente.nombre_cliente}
          soloLectura={true}
        />
        <QInput
          nombre="id_fiscal"
          label={t("documento.detalle.idFiscal")}
          valor={modelo.cliente.id_fiscal}
          soloLectura={true}
        />

        {clienteEditable && (
          <div className="TabCliente-accion">
            <BotonCambiar
              titulo={t("documento.detalle.cambiarCliente")}
              onClick={() => publicar("cambio_cliente_solicitado")}
            />
          </div>
        )}

        <QInput
          soloLectura={true}
          label={t("documento.detalle.direccion")}
          nombre="direccion_cliente"
          valor={formatearDireccionVenta(modelo.cliente.direccion)}
        />
      </quimera-formulario>

      {clienteEditable && estado === "CAMBIANDO_CLIENTE" && (
        <CambioClienteVenta
          venta={pedido}
          onGuardar={onGuardarCambioCliente}
          onCancelar={() => publicar("cambio_cliente_cancelado")}
        />
      )}
    </div>
  );
};
