import { BorrarLinea } from "../../borrar_linea/BorrarLinea.tsx";
import { CrearLinea } from "../../crear_linea/CrearLinea.tsx";
import { Albaran, LineaAlbaran } from "../../diseño.ts";
import { editable } from "../../dominio.ts";
import { CambiarLinea } from "../../cambiar_linea/CambiarLinea.tsx";
import { LineasLista } from "./LineasLista.tsx";
import { useTVentas } from "../../../i18n/index.ts";

export const Lineas = ({
  albaran,
  lineaActiva,
  estadoAlbaran,
  publicar,
}: {
  albaran: Albaran;
  lineaActiva: LineaAlbaran | null;
  estadoAlbaran: string;
  publicar: (evento: string, payload?: unknown) => void;
}) => {
  const t = useTVentas();
  const handleCambioCantidad = (linea: LineaAlbaran, cantidad: number) => {
    publicar("cambio_cantidad_linea_solicitado", {
      lineaId: linea.id,
      cantidad: cantidad,
    });
  };

  const esEditable = estadoAlbaran === "ABIERTO" && editable(albaran);
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

  return (
    <>
      <LineasLista
        lineas={albaran.lineas || []}
        seleccionada={lineaActiva?.id}
        onCambioCantidad={handleCambioCantidad}
        divisa={albaran.divisa_id}
        albaranEditable={esEditable}
        acciones={esEditable ? acciones : undefined}
        publicar={publicar}
      />

      {estadoAlbaran === "CREANDO_LINEA" && (
        <CrearLinea albaranId={albaran.id} publicar={publicar} />
      )}

      {lineaActiva && estadoAlbaran === "CAMBIANDO_LINEA" && (
        <CambiarLinea
          publicar={publicar}
          linea={lineaActiva}
          albaranId={albaran.id}
        />
      )}

      {lineaActiva && estadoAlbaran === "BORRANDO_LINEA" && (
        <BorrarLinea
          publicar={publicar}
          linea={lineaActiva}
          albaranId={albaran.id}
        />
      )}
    </>
  );
};
