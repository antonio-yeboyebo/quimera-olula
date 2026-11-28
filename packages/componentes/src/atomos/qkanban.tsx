import {
  type DragEndEvent,
  type DragStartEvent,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Entidad } from "@olula/lib/diseño.ts";
import { type ReactNode, useEffect, useState } from "react";
import { QTarjetaMetatabla } from "../moleculas/qtarjeta_metatabla.tsx";
import "./qkanban.css";
import { MetaTabla } from "./qtablacontrolada.tsx";
import { useTComponentes } from "../i18n/textos.ts";

export type QKanbanColumna = {
  id: string;
  etiqueta: string;
  color?: string;
  resumen?: ReactNode;
};

export type QKanbanProps<T extends Entidad> = {
  entidades: T[];
  cargando?: boolean;
  columnas: QKanbanColumna[];
  campoEstado: keyof T;
  tarjeta?: (entidad: T) => ReactNode;
  metaTabla?: MetaTabla<T>;
  seleccionadaId?: string;
  onSeleccion?: (entidad: T) => void;
  onCambioEstado: (id: string, nuevoEstado: string) => void | Promise<void>;
};

type QKanbanTarjetaProps<T extends Entidad> = {
  entidad: T;
  tarjeta: (entidad: T) => ReactNode;
  seleccionada?: boolean;
  onSeleccion?: (entidad: T) => void;
};

const QKanbanTarjeta = <T extends Entidad>({
  entidad,
  tarjeta,
  seleccionada = false,
  onSeleccion,
}: QKanbanTarjetaProps<T>) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: entidad.id,
    });

  return (
    <div
      ref={setNodeRef}
      className="qkanban-tarjeta-arrastrable"
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        opacity: isDragging ? 0.55 : 1,
        position: "relative",
        zIndex: isDragging ? 1000 : "auto",
      }}
      {...attributes}
      {...listeners}
      onClick={() => onSeleccion?.(entidad)}
    >
      <quimera-tarjeta className={seleccionada ? "seleccionada" : ""}>
        {tarjeta(entidad)}
      </quimera-tarjeta>
    </div>
  );
};

type QKanbanColumnaVistaProps<T extends Entidad> = {
  columna: QKanbanColumna;
  entidades: T[];
  tarjeta: (entidad: T) => ReactNode;
  seleccionadaId?: string;
  onSeleccion?: (entidad: T) => void;
};

const QKanbanColumnaVista = <T extends Entidad>({
  columna,
  entidades,
  tarjeta,
  seleccionadaId,
  onSeleccion,
}: QKanbanColumnaVistaProps<T>) => {
  const t = useTComponentes();
  const { setNodeRef, isOver } = useDroppable({ id: columna.id });

  return (
    <section
      className={`qkanban-columna${isOver ? " encima" : ""}`}
      style={{
        ["--qkanban-color" as string]: columna.color ?? "var(--color-primario)",
      }}
    >
      <header className="qkanban-columna-cabecera">
        <div className="qkanban-columna-cabecera-textos">
          <div className="qkanban-columna-titulo">{columna.etiqueta}</div>
          {columna.resumen && (
            <div className="qkanban-columna-resumen">{columna.resumen}</div>
          )}
        </div>
        <div className="qkanban-columna-badge">{entidades.length}</div>
      </header>

      <div ref={setNodeRef} className="qkanban-columna-cuerpo">
        {entidades.length === 0 ? (
          <div className="qkanban-vacio">{t("ui.atomos.sinTarjetas")}</div>
        ) : (
          entidades.map((entidad) => (
            <QKanbanTarjeta
              key={entidad.id}
              entidad={entidad}
              tarjeta={tarjeta}
              seleccionada={entidad.id === seleccionadaId}
              onSeleccion={onSeleccion}
            />
          ))
        )}
      </div>
    </section>
  );
};

export const QKanban = <T extends Entidad>({
  entidades,
  cargando = false,
  columnas,
  campoEstado,
  tarjeta,
  metaTabla,
  seleccionadaId,
  onSeleccion,
  onCambioEstado,
}: QKanbanProps<T>) => {
  const t = useTComponentes();
  const [idActivaArrastre, setIdActivaArrastre] = useState<string | null>(null);
  const [estadoOptimista, setEstadoOptimista] = useState<Record<string, string>>(
    {}
  );
  const sensores = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  const tarjetaRender =
    tarjeta ??
    (metaTabla
      ? (entidad: T) => (
          <QTarjetaMetatabla entidad={entidad} metaTabla={metaTabla} />
        )
      : undefined);

  useEffect(() => {
    setEstadoOptimista({});
  }, [entidades]);

  const estadoDe = (entidad: T) =>
    estadoOptimista[entidad.id] ?? String(entidad[campoEstado]);

  const columnasAgrupadas = columnas.map((columna) => ({
    ...columna,
    entidades: entidades.filter((entidad) => estadoDe(entidad) === columna.id),
  }));

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setIdActivaArrastre(null);

    if (!over || active.id === over.id) return;

    const nuevaColumna = columnas.find(
      (columna) => columna.id === String(over.id)
    );
    if (!nuevaColumna) return;

    const entidadArrastrada = entidades.find(
      (entidad) => entidad.id === String(active.id)
    );
    if (!entidadArrastrada) return;

    const idEntidad = String(active.id);
    const estadoPrevio = estadoDe(entidadArrastrada);
    if (estadoPrevio === nuevaColumna.id) return;

    setEstadoOptimista((previo) => ({
      ...previo,
      [idEntidad]: nuevaColumna.id,
    }));

    Promise.resolve(onCambioEstado(idEntidad, nuevaColumna.id)).catch(() =>
      setEstadoOptimista((previo) => ({
        ...previo,
        [idEntidad]: estadoPrevio,
      }))
    );
  };

  const onDragStart = ({ active }: DragStartEvent) => {
    setIdActivaArrastre(String(active.id));
  };

  const onDragCancel = () => {
    setIdActivaArrastre(null);
  };

  const entidadActiva = idActivaArrastre
    ? entidades.find((entidad) => entidad.id === idActivaArrastre)
    : undefined;

  if (cargando && entidades.length === 0) {
    return (
      <div className="QKanban">
        <div className="qkanban-cargando">{t("ui.atomos.cargando")}</div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensores}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="QKanban">
        <div className="qkanban-contenedor">
          {columnasAgrupadas.map((columna) => (
            <QKanbanColumnaVista
              key={columna.id}
              columna={columna}
              entidades={columna.entidades}
              tarjeta={
                tarjetaRender ??
                ((entidad: T) => (
                  <QTarjetaMetatabla entidad={entidad} metaTabla={metaTabla!} />
                ))
              }
              seleccionadaId={seleccionadaId}
              onSeleccion={onSeleccion}
            />
          ))}
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {entidadActiva && tarjetaRender ? (
          <div className="qkanban-tarjeta-arrastrable">
            <quimera-tarjeta>{tarjetaRender(entidadActiva)}</quimera-tarjeta>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
