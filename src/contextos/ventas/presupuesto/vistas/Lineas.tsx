import { useState } from "react";
import { refrescarSeleccionada } from "../../../comun/dominio.ts";
import { EventoCantidadLineaCambiada, EventoReferenciaLineaCambiada, LineaPresupuesto as Linea, LineaPresupuestoNueva } from "../diseño.ts";
import { getLineas } from "../infraestructura.ts";
import { AltaLinea } from "./AltaLinea.tsx";
import { EdicionLinea } from "./EdicionLinea.tsx";
import { LineasLista } from "./LineasLista.tsx";

type EventoLineaModificada = EventoCantidadLineaCambiada | EventoReferenciaLineaCambiada;

export const Lineas = ({
  onCabeceraModificada,
  presupuestoId,
}: {
  onCabeceraModificada: () => void;
  presupuestoId: string;
}) => {
  const [modo, setModo] = useState("lista");
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [seleccionada, setSeleccionada] = useState<Linea | null>(null);

  const actualizarLinea = async (linea: Linea) => {
    const lineas = await getLineas(presupuestoId);
    setLineas(lineas);
    onCabeceraModificada();
    refrescarSeleccionada(lineas, linea.id, setSeleccionada);
  };

  const añadirLinea = async (_: LineaPresupuestoNueva, id: string) => {
    const lineas = await getLineas(presupuestoId);
    setLineas(lineas);
    onCabeceraModificada();
    refrescarSeleccionada(lineas, id, setSeleccionada);
    setModo("lista");
  };

  return (
    <>
      <LineasLista
        presupuestoId={presupuestoId}
        onEditarLinea={() => setModo("edicion")}
        onCrearLinea={() => setModo("alta")}
        onLineaBorrada={onCabeceraModificada}
        onLineaCambiada={actualizarLinea}
        lineas={lineas}
        setLineas={setLineas}
        seleccionada={seleccionada}
        setSeleccionada={setSeleccionada}
      />
      {modo === "edicion" && seleccionada && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModo("lista")}>
              &times;
            </span>
            <EdicionLinea
              presupuestoId={presupuestoId}
              linea={seleccionada}
              onLineaActualizada={actualizarLinea}
              onCancelar={() => setModo("lista")}
            />
          </div>
        </div>
      )}
      {modo === "alta" && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModo("lista")}>
              &times;
            </span>
            <AltaLinea
              presupuestoId={presupuestoId}
              onLineaCreada={añadirLinea}
              onCancelar={() => setModo("lista")}
            />
          </div>
        </div>
      )}
    </>
  );
};
