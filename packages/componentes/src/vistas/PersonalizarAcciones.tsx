import { useEffect, useRef, useState } from "react";
import { QIcono } from "../atomos/qicono.tsx";
import { AccionDefinida } from "../moleculas/acciones.ts";
import { desplazarColumna } from "./dominio.ts";
import { MenuFlotante } from "./MenuFlotante.tsx";
import "./SelectorColumnas.css";

/** Acciones con id: marcadas (botón, en su orden, con subir/bajar) y el resto. */
export const ListaDestacadas = ({
  acciones,
  destacadas,
  enMenu = [],
  onCambiar,
}: {
  acciones: AccionDefinida[];
  /** Ids que salen ahora como botón, en su orden. */
  destacadas: string[];
  /** Destacadas que no caben y están ahora en «Más acciones». */
  enMenu?: string[];
  onCambiar: (destacadas: string[]) => void;
}) => {
  const conId = acciones.filter(
    (accion): accion is AccionDefinida & { id: string } => !!accion.id
  );
  const porId = new Map(conId.map((accion) => [accion.id, accion]));
  const ordenadas = [
    ...destacadas.flatMap((id) => porId.get(id) ?? []),
    ...conId.filter((accion) => !destacadas.includes(accion.id)),
  ];

  // Al mover una acción la lista se reordena y el botón pulsado puede perder el
  // foco: se le devuelve y se anuncia la nueva posición.
  const lista = useRef<HTMLUListElement>(null);
  const [movida, setMovida] = useState<{ boton: string; aviso: string } | null>(null);
  useEffect(() => {
    if (!movida) return;
    lista.current
      ?.querySelector<HTMLElement>(`button[aria-label="${CSS.escape(movida.boton)}"]`)
      ?.focus();
  }, [movida]);

  const mover = (id: string, texto: string | undefined, sentido: -1 | 1) => {
    const nuevas = desplazarColumna(destacadas, id, sentido);
    if (nuevas === destacadas) return;
    onCambiar(nuevas);
    setMovida({
      boton: `${sentido < 0 ? "Subir" : "Bajar"} ${texto}`,
      aviso: `${texto}: posición ${nuevas.indexOf(id) + 1} de ${nuevas.length}`,
    });
  };

  return (
    <>
      <p className="selector-columnas-aviso" aria-live="polite">
        {movida?.aviso}
      </p>
      <ul ref={lista}>
        {ordenadas.map(({ id, texto }) => {
          const destacada = destacadas.includes(id);
          const posicion = destacadas.indexOf(id);
          return (
            <li key={id} data-visible={destacada}>
              <label>
                <input
                  type="checkbox"
                  checked={destacada}
                  onChange={() =>
                    onCambiar(
                      destacada
                        ? destacadas.filter((otro) => otro !== id)
                        : [...destacadas, id]
                    )
                  }
                />
                <span>
                  {texto}
                  {enMenu.includes(id) && (
                    <small className="selector-columnas-nota"> (no cabe: va en «Más acciones»)</small>
                  )}
                </span>
              </label>
              {destacada && (
                <span className="selector-columnas-mover">
                  <button
                    type="button"
                    aria-label={`Subir ${texto}`}
                    // aria-disabled: en el extremo sigue enfocable y no se pierde el foco.
                    aria-disabled={posicion === 0}
                    onClick={() => mover(id, texto, -1)}
                  >
                    <QIcono nombre="arriba" tamaño="xs" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Bajar ${texto}`}
                    aria-disabled={posicion === destacadas.length - 1}
                    onClick={() => mover(id, texto, 1)}
                  >
                    <QIcono nombre="abajo" tamaño="xs" />
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
};

/**
 * Qué acciones salen como botón y en qué orden. Solo se pueden elegir las que
 * tienen id; el resto va siempre al desplegable.
 */
export const PersonalizarAcciones = ({
  ancla,
  acciones,
  destacadas,
  enMenu = [],
  personalizada,
  onCambiar,
  onRestaurar,
  onCerrar,
}: {
  ancla: HTMLElement;
  acciones: AccionDefinida[];
  destacadas: string[];
  enMenu?: string[];
  /** El usuario ya eligió (se puede restaurar). */
  personalizada: boolean;
  onCambiar: (destacadas: string[]) => void;
  onRestaurar: () => void;
  onCerrar: () => void;
}) => (
  <MenuFlotante
    ancla={ancla}
    onCerrar={onCerrar}
    alineacion="derecha"
    etiqueta="Botones destacados"
    rol="dialog"
  >
    <div className="selector-columnas">
      <p className="selector-columnas-ayuda">
        Las acciones marcadas salen como botón, en este orden. El resto, en «Más acciones».
      </p>
      <ListaDestacadas
        acciones={acciones}
        destacadas={destacadas}
        enMenu={enMenu}
        onCambiar={onCambiar}
      />
      <div className="selector-columnas-pie">
        <button
          type="button"
          disabled={!personalizada}
          onClick={() => {
            onRestaurar();
            onCerrar();
          }}
        >
          Restaurar botones por defecto
        </button>
      </div>
    </div>
  </MenuFlotante>
);
