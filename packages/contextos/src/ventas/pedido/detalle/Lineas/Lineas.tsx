import { QBoton } from "@olula/componentes/index.ts";
import { BorrarLinea } from "../../borrar_linea/BorrarLinea.tsx";
import { CrearLinea } from "../../crear_linea/CrearLinea.tsx";
import { LineaPedido, Pedido } from "../../diseño.ts";
import { EditarLinea } from "../../editar_linea/EditarLinea.tsx";
import { LineasLista } from "./LineasLista.tsx";

export const Lineas = ({
  pedido,
  lineaActiva,
  estadoPedido,
  publicar,
}: {
  pedido: Pedido;
  lineaActiva: LineaPedido | null;
  estadoPedido: string;
  publicar: (evento: string, payload?: unknown) => void;
}) => {
  const handleCambioCantidad = (linea: LineaPedido, cantidad: number) => {
    publicar("cambio_cantidad_linea_solicitado", {
      lineaId: linea.id,
      cantidad: cantidad,
    });
  };

  return (
    <>
      {estadoPedido === "ABIERTO" && pedido.servido != "TOTAL" && (
        <div className="botones maestro-botones ">
          <QBoton onClick={() => publicar("alta_linea_solicitada")}>
            Nueva
          </QBoton>

          <QBoton
            deshabilitado={!lineaActiva}
            onClick={() => publicar("cambio_linea_solicitado")}
          >
            Editar
          </QBoton>

          <QBoton
            deshabilitado={!lineaActiva}
            onClick={() => publicar("baja_linea_solicitada")}
          >
            Borrar
          </QBoton>
        </div>
      )}

      <LineasLista
        key={pedido.id}
        lineas={pedido.lineas || []}
        seleccionada={lineaActiva?.id}
        onCambioCantidad={handleCambioCantidad}
        pedidoEditable={estadoPedido === "ABIERTO" && pedido.servido != "TOTAL"}
        publicar={publicar}
      />

      {estadoPedido === "CREANDO_LINEA" && (
        <CrearLinea pedidoId={pedido.id} publicar={publicar} />
      )}

      {lineaActiva && estadoPedido === "CAMBIANDO_LINEA" && (
        <EditarLinea
          pedidoId={pedido.id}
          publicar={publicar}
          linea={lineaActiva}
        />
      )}

      {lineaActiva && estadoPedido === "BORRANDO_LINEA" && (
        <BorrarLinea
          pedidoId={pedido.id}
          publicar={publicar}
          idLinea={lineaActiva.id}
        />
      )}
    </>
  );
};
