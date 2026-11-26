import { EmitirEvento } from "@olula/lib/diseño.ts";
import { ListaEntidades } from "@olula/lib/ListaEntidades.ts";
import { BorrarLineaPedido } from "../../borrar_linea/BorrarLineaPedido.tsx";
import { CambiarLineaPedido } from "../../cambiar_linea/CambiarLineaPedido.tsx";
import { CrearLineaPedido } from "../../crear_linea/CrearLineaPedido.tsx";
import { LineaPedido, Pedido } from "../../diseño.ts";
import { pedidoPendiente } from "../../dominio.ts";
import { EstadoDetallePedido } from "../diseño.ts";
import { LineasLista } from "./LineasLista.tsx";
import { useTCompras } from "#/compras/i18n/index.ts";

export const LineasPedido = ({
  pedido,
  lineas,
  estado,
  publicar,
}: {
  pedido: Pedido;
  lineas: ListaEntidades<LineaPedido>;
  estado: EstadoDetallePedido;
  publicar: EmitirEvento;
}) => {
  const t = useTCompras();
  const activa = lineas.activo;
  const pendiente = pedidoPendiente(pedido);

  const acciones = [
    {
      texto: t("comun.botones.nueva"),
      onClick: () => publicar("alta_linea_solicitada"),
    },
    {
      texto: t("comun.botones.editar"),
      onClick: () => publicar("cambio_linea_solicitado"),
      deshabilitado: !activa,
    },
    {
      icono: "eliminar",
      texto: t("comun.botones.borrar"),
      advertencia: true,
      onClick: () => publicar("baja_linea_solicitada"),
      deshabilitado: !activa,
    },
  ];

  return (
    <>
      <LineasLista
        lineas={lineas.lista}
        divisa={pedido.divisaId}
        seleccionada={activa?.id}
        acciones={pendiente ? acciones : undefined}
        publicar={publicar}
      />
      {estado === "CREANDO_LINEA" && (
        <CrearLineaPedido pedido={pedido} publicar={publicar} />
      )}
      {activa && estado === "CAMBIANDO_LINEA" && (
        <CambiarLineaPedido
          pedido={pedido}
          linea={activa}
          publicar={publicar}
        />
      )}
      {activa && estado === "BORRANDO_LINEA" && (
        <BorrarLineaPedido pedido={pedido} linea={activa} publicar={publicar} />
      )}
    </>
  );
};
