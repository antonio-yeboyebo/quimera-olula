import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { FactoryCtx } from "@olula/lib/factory_ctx.js";
import { useContext } from "react";
import { LineaPedido as Linea } from "../../diseño.ts";
import { EditarCantidadLinea } from "./EditarCantidadLinea.tsx";


export type LineasListaProps<L extends Linea = Linea> = {
  lineas: L[];
  seleccionada?: string;
  onCambioCantidad?: (linea: L, cantidad: number) => void;
  pedidoEditable?: boolean;
  publicar: (evento: string, payload?: unknown) => void;
};

export const LineasLista = (props: LineasListaProps) => {
  
  const { app } = useContext(FactoryCtx);
  const LineasLista_ = app.Ventas.pedido_detalle_lineas_LineasLista as typeof LineasListaBase;

  return LineasLista_(props);
}

export const LineasListaBase = ({
  lineas,
  seleccionada,
  onCambioCantidad,
  pedidoEditable,
  publicar,
}: LineasListaProps) => {
  const setSeleccionada = (linea: Linea) => {
    publicar("linea_seleccionada", linea);
  };

  return (
    <>
      <QTabla
        metaTabla={getMetaTablaLineas(onCambioCantidad, pedidoEditable)}
        datos={lineas}
        cargando={false}
        seleccionadaId={seleccionada}
        onSeleccion={setSeleccionada}
        orden={["id", "ASC"]}
        onOrdenar={(_: string) => null}
      />
    </>
  );
};

const getMetaTablaLineas = (
  onCambioCantidad?: (linea: Linea, cantidad: number) => void,
  pedidoEditable?: boolean
) => {
  return [
    {
      id: "linea",
      cabecera: "Línea",
      render: (linea: Linea) => `${linea.referencia}: ${linea.descripcion}`,
    },
    {
      id: "cantidad",
      cabecera: "Cantidad",
      render: (linea: Linea) =>
        pedidoEditable && onCambioCantidad ? (
          <EditarCantidadLinea
            linea={linea}
            onCantidadEditada={onCambioCantidad}
          />
        ) : (
          <span>{linea.cantidad}</span>
        ),
    },
    {
      id: "pvp_unitario",
      cabecera: "Precio",
    },
    {
      id: "grupo_iva_producto_id",
      cabecera: "IVA",
    },
    {
      id: "dto_porcentual",
      cabecera: "% Dto.",
      render: (linea: Linea) =>
        linea.dto_porcentual ? `${linea.dto_porcentual}%` : "",
    },
    {
      id: "pvp_total",
      cabecera: "Total",
      tipo: "moneda" as const,
    },
  ];
};
