import { EmitirEvento } from "@olula/lib/diseño.js";
import { BorrarLinea } from "../../borrar_linea/BorrarLinea.tsx";
import { CrearLinea } from "../../crear_linea/CrearLinea.tsx";
import { LineaPresupuesto, Presupuesto } from "../../diseño.ts";
import { CambiarLinea } from "../../cambiar_linea/CambiarLinea.tsx";
import { LineasLista } from "./LineasLista.tsx";
import { aprobado } from "../../dominio.ts";
import { useTVentas } from "../../../i18n/index.ts";

export const Lineas = ({
  presupuesto,
  lineaActiva,
  estadoPresupuesto,
  publicar,
}: {
  presupuesto: Presupuesto;
  lineaActiva: LineaPresupuesto | null;
  estadoPresupuesto: string;
  publicar: EmitirEvento;
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

  const handleCambioCantidad = (linea: LineaPresupuesto, cantidad: number) => {
    publicar("cambio_cantidad_linea_solicitado", {
      lineaId: linea.id,
      cantidad: cantidad,
    });
  };

  return (
    <>
      <LineasLista
        lineas={presupuesto.lineas || []}
        seleccionada={lineaActiva?.id}
        onCambioCantidad={handleCambioCantidad}
        divisa={presupuesto.divisa_id}
        presupuestoEditable={
          estadoPresupuesto === "ABIERTO" && !aprobado(presupuesto)
        }
        acciones={
          estadoPresupuesto === "ABIERTO" && !aprobado(presupuesto)
            ? acciones
            : undefined
        }
        publicar={publicar}
      />

      {estadoPresupuesto === "CREANDO_LINEA" && (
        <CrearLinea presupuestoId={presupuesto.id} publicar={publicar} />
      )}

      {lineaActiva && estadoPresupuesto === "CAMBIANDO_LINEA" && (
        <CambiarLinea
          presupuestoId={presupuesto.id}
          publicar={publicar}
          linea={lineaActiva}
        />
      )}

      {lineaActiva && estadoPresupuesto === "BORRANDO_LINEA" && (
        <BorrarLinea
          presupuestoId={presupuesto.id}
          publicar={publicar}
          linea={lineaActiva}
        />
      )}
    </>
  );
};
