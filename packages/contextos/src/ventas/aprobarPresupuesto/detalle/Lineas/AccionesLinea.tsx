import { QIcono } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useContext } from "react";
import { LineaAprobarPresupuesto } from "../../diseño.ts";
import { patchCerrarLineaPresupuesto } from "../../infraestructura.ts";
import "./AccionesLinea.css";
import { useTVentas } from "../../../i18n/index.ts";

export const AccionesLinea = ({
  linea,
  presupuestoId,
  publicar,
}: {
  linea: LineaAprobarPresupuesto;
  presupuestoId: string;
  publicar: EmitirEvento;
}) => {
  const t = useTVentas();
  const { intentar } = useContext(ContextoError);

  // El nombre accesible y el título visual comparten el mismo texto para que
  // el estado (no solo el color) llegue también a lectores de pantalla.
  const etiquetaCandado = linea.cerrada ? t("presupuesto.aprobarParcial.abrirLinea") : t("presupuesto.aprobarParcial.cerrarLinea");

  const toggleCerrada = async () => {
    if (!linea.id) return;
    const cerrada = !linea.cerrada;
    await intentar(() => patchCerrarLineaPresupuesto(presupuestoId, linea.id, cerrada));
    await publicar("linea_cerrada_actualizada", { id: linea.id, cerrada });
  };

  return (
    <div className="acciones-linea">
      <button
        type="button"
        className="accion-icono"
        onClick={toggleCerrada}
        title={etiquetaCandado}
        aria-label={etiquetaCandado}
        aria-pressed={!!linea.cerrada}
      >
        <QIcono
          nombre={linea.cerrada ? "candado" : "candado_abierto"}
          tamaño="sm"
          color={linea.cerrada ? "var(--color-error)" : undefined}
        />
      </button>
    </div>
  );
};
