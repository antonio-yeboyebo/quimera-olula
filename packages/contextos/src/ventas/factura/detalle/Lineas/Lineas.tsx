import { BorrarLinea } from "../../borrar_linea/BorrarLinea.tsx";
import { CrearLinea } from "../../crear_linea/CrearLinea.tsx";
import { Factura, LineaFactura } from "../../diseño.ts";
import { EditarLinea } from "../../editar_linea/EditarLinea.tsx";
import { editable } from "../diseño.ts";
import { LineasLista } from "./LineasLista.tsx";
import { useTVentas } from "../../../i18n/index.ts";
export const Lineas = ({
  factura,
  lineaActiva,
  estadoFactura,
  publicar,
}: {
  factura: Factura;
  lineaActiva: LineaFactura | null;
  estadoFactura: string;
  publicar: (evento: string, payload?: unknown) => void;
}) => {
  const t = useTVentas();
  const acciones = [
    {
      texto: t("documento.lineas.nueva"),
      onClick: () => publicar("alta_linea_solicitada"),
    },
    {
      texto: t("documento.lineas.editar"),
      onClick: () => publicar("cambio_linea_solicitado"),
      deshabilitado: !lineaActiva,
    },
    {
      icono: "eliminar",
      texto: t("documento.detalle.borrar"),
      advertencia: true,
      onClick: () => publicar("baja_linea_solicitada"),
      deshabilitado: !lineaActiva,
    },
  ];

  const handleCambioCantidad = (linea: LineaFactura, cantidad: number) => {
    publicar("cambio_cantidad_linea_solicitado", {
      lineaId: linea.id,
      cantidad: cantidad,
    });
  };

  const facturaEsEditable = editable(factura);

  return (
    <>
      <LineasLista
        lineas={factura.lineas || []}
        seleccionada={lineaActiva?.id}
        onCambioCantidad={handleCambioCantidad}
        divisa={factura.divisa_id}
        facturaEditable={facturaEsEditable}
        acciones={facturaEsEditable ? acciones : undefined}
        publicar={publicar}
      />
      {estadoFactura === "CREANDO_LINEA" && <CrearLinea facturaId={factura.id} publicar={publicar} />}

      {lineaActiva && estadoFactura === "CAMBIANDO_LINEA" && (
        <EditarLinea publicar={publicar} linea={lineaActiva} />
      )}

      {lineaActiva && estadoFactura === "BORRANDO_LINEA" && (
        <BorrarLinea publicar={publicar} idLinea={lineaActiva.id} />
      )}
    </>
  );
};
