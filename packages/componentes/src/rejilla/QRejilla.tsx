import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  KeyboardCoordinateGetter,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useEsMovil } from "@olula/lib/useEsMovil.ts";
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { QIcono } from "../atomos/qicono.tsx";
import {
  ajustarElemento,
  celdasDesplazadas,
  COLUMNAS_REJILLA,
  ElementoRejilla,
  moverElemento,
  ordenLectura,
  redimensionarElemento,
} from "./dominio.ts";
import "./QRejilla.css";
import { useTComponentes } from "../i18n/textos.ts";

type Modo = "mover" | "tamaño";

type Arrastre = { id: string; modo: Modo; destino: ElementoRejilla };

const leerId = (id: string | number): { modo: Modo; id: string } => {
  const [modo, ...resto] = String(id).split(":");
  return { modo: modo as Modo, id: resto.join(":") };
};

const posicionEnRejilla = (e: ElementoRejilla): CSSProperties => ({
  gridColumn: `${e.x + 1} / span ${e.w}`,
  gridRow: `${e.y + 1} / span ${e.h}`,
});

type QRejillaProps<T extends ElementoRejilla> = {
  elementos: T[];
  /** Muestra las asas de mover y de cambiar tamaño (nunca en el móvil). */
  editable?: boolean;
  /** Alto de una fila en píxeles. */
  altoFila?: number;
  separacion?: number;
  renderizar: (elemento: T) => ReactNode;
  /** Nombre de cada elemento para los lectores de pantalla («Mover Ventas por mes»). */
  etiqueta?: (elemento: T) => string;
  onCambiar?: (elementos: T[]) => void;
};

/**
 * Rejilla de 12 columnas con filas de alto fijo. En edición, cada elemento se mueve
 * con su asa (ratón o flechas, celda a celda) y cambia de tamaño con la esquina; los
 * demás se recolocan sin solaparse. En el móvil es una sola columna en orden de lectura.
 */
export const QRejilla = <T extends ElementoRejilla>({
  elementos,
  editable = false,
  altoFila = 72,
  separacion = 16,
  renderizar,
  etiqueta = (e) => e.id,
  onCambiar,
}: QRejillaProps<T>) => {
  const ref = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(0);
  const [arrastre, setArrastre] = useState<Arrastre | null>(null);
  const esMovil = useEsMovil();
  const enEdicion = editable && !esMovil;

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;
    const observador = new ResizeObserver(([entrada]) =>
      setAncho(entrada.contentRect.width)
    );
    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  const anchoColumna =
    (ancho - separacion * (COLUMNAS_REJILLA - 1)) / COLUMNAS_REJILLA;

  // Con el teclado, cada flecha es una celda.
  const coordenadas: KeyboardCoordinateGetter = (evento, { currentCoordinates }) => {
    const pasoX = anchoColumna + separacion;
    const pasoY = altoFila + separacion;
    const { x, y } = currentCoordinates;
    switch (evento.code) {
      case "ArrowRight":
        return { x: x + pasoX, y };
      case "ArrowLeft":
        return { x: x - pasoX, y };
      case "ArrowDown":
        return { x, y: y + pasoY };
      case "ArrowUp":
        return { x, y: y - pasoY };
    }
    return undefined;
  };

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: coordenadas })
  );

  const destino = (
    evento: DragMoveEvent | DragEndEvent
  ): Arrastre | null => {
    const { modo, id } = leerId(evento.active.id);
    const elemento = elementos.find((e) => e.id === id);
    if (!elemento) return null;
    const dx = celdasDesplazadas(evento.delta.x, anchoColumna, separacion);
    const dy = celdasDesplazadas(evento.delta.y, altoFila, separacion);
    const cambiado =
      modo === "mover"
        ? { ...elemento, x: elemento.x + dx, y: elemento.y + dy }
        : { ...elemento, w: elemento.w + dx, h: elemento.h + dy };
    return { id, modo, destino: ajustarElemento(cambiado) };
  };

  const alSoltar = (evento: DragEndEvent) => {
    setArrastre(null);
    const resultado = destino(evento);
    if (!resultado || !onCambiar) return;
    const { id, modo, destino: d } = resultado;
    onCambiar(
      modo === "mover"
        ? moverElemento(elementos, id, d.x, d.y)
        : redimensionarElemento(elementos, id, d.w, d.h)
    );
  };

  return (
    <DndContext
      sensors={sensores}
      onDragMove={(evento) => setArrastre(destino(evento))}
      onDragEnd={alSoltar}
      onDragCancel={() => setArrastre(null)}
    >
      <div
        ref={ref}
        className="qrejilla"
        data-editable={enEdicion || undefined}
        style={
          {
            "--alto-fila": `${altoFila}px`,
            "--separacion-rejilla": `${separacion}px`,
          } as CSSProperties
        }
      >
        {ordenLectura(elementos).map((elemento) => (
          <CeldaRejilla
            key={elemento.id}
            elemento={elemento}
            editable={enEdicion}
            etiqueta={etiqueta(elemento)}
            arrastrando={arrastre?.id === elemento.id ? arrastre.modo : null}
          >
            {renderizar(elemento)}
          </CeldaRejilla>
        ))}
        {arrastre && (
          <div
            className="qrejilla-destino"
            style={posicionEnRejilla(arrastre.destino)}
            aria-hidden="true"
          />
        )}
      </div>
    </DndContext>
  );
};

const CeldaRejilla = ({
  elemento,
  editable,
  etiqueta,
  arrastrando,
  children,
}: {
  elemento: ElementoRejilla;
  editable: boolean;
  etiqueta: string;
  arrastrando: Modo | null;
  children: ReactNode;
}) => {
  const t = useTComponentes();
  const mover = useDraggable({ id: `mover:${elemento.id}`, disabled: !editable });
  const tamaño = useDraggable({ id: `tamaño:${elemento.id}`, disabled: !editable });

  const estilo: CSSProperties = { ...posicionEnRejilla(elemento) };
  if (arrastrando === "mover" && mover.transform) {
    estilo.transform = `translate(${mover.transform.x}px, ${mover.transform.y}px)`;
  }
  if (arrastrando === "tamaño" && tamaño.transform) {
    estilo.width = `calc(100% + ${tamaño.transform.x}px)`;
    estilo.height = `calc(100% + ${tamaño.transform.y}px)`;
  }

  return (
    <div
      className="qrejilla-elemento"
      style={estilo}
      data-arrastrando={arrastrando ?? undefined}
    >
      {editable && (
        <button
          ref={mover.setNodeRef}
          type="button"
          className="qrejilla-mover"
          aria-label={t("ui.rejilla.moverEtiqueta", { etiqueta })}
          {...mover.listeners}
          {...mover.attributes}
        >
          <QIcono nombre="menu" tamaño="sm" />
        </button>
      )}
      {children}
      {editable && (
        <button
          ref={tamaño.setNodeRef}
          type="button"
          className="qrejilla-tamaño"
          aria-label={t("ui.rejilla.cambiarTamanoDeEtiqueta", { etiqueta })}
          {...tamaño.listeners}
          {...tamaño.attributes}
        />
      )}
    </div>
  );
};
