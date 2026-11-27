import { useCallback, useEffect, useRef, useState } from "react";
import { QIcono } from "../atomos/qicono.tsx";
import { desplazarColumna, ocultarColumna } from "./dominio.ts";
import { MenuFlotante } from "./MenuFlotante.tsx";
import "./SelectorColumnas.css";

export type ColumnaSelector = { id: string; cabecera: string };

/** Columnas visibles (marcadas, en su orden, con subir/bajar) y ocultas. */
export const ListaColumnas = ({
  catalogo,
  visibles,
  onCambiar,
}: {
  catalogo: ColumnaSelector[];
  visibles: string[];
  onCambiar: (visibles: string[]) => void;
}) => {
  const porId = new Map(catalogo.map((columna) => [columna.id, columna]));
  const ocultas = catalogo.filter((columna) => !visibles.includes(columna.id));
  const ordenadas = [
    ...visibles.map((id) => porId.get(id)).filter((c): c is ColumnaSelector => !!c),
    ...ocultas,
  ];

  const alternar = (id: string) =>
    onCambiar(visibles.includes(id) ? ocultarColumna(visibles, id) : [...visibles, id]);

  // Al mover una columna la lista se reordena y el botón pulsado puede perder el
  // foco: se le devuelve y se anuncia la nueva posición (como en los botones).
  const lista = useRef<HTMLUListElement>(null);
  const [movida, setMovida] = useState<{ boton: string; aviso: string } | null>(null);
  useEffect(() => {
    if (!movida) return;
    lista.current
      ?.querySelector<HTMLElement>(`button[aria-label="${CSS.escape(movida.boton)}"]`)
      ?.focus();
  }, [movida]);

  const mover = (id: string, cabecera: string, sentido: -1 | 1) => {
    const nuevas = desplazarColumna(visibles, id, sentido);
    if (nuevas === visibles) return;
    onCambiar(nuevas);
    setMovida({
      boton: `${sentido < 0 ? "Subir" : "Bajar"} ${cabecera}`,
      aviso: `${cabecera}: posición ${nuevas.indexOf(id) + 1} de ${nuevas.length}`,
    });
  };

  return (
    <>
    <p className="selector-columnas-aviso" aria-live="polite">
      {movida?.aviso}
    </p>
    <ul ref={lista}>
      {ordenadas.map(({ id, cabecera }) => {
        const visible = visibles.includes(id);
        const posicion = visibles.indexOf(id);
        return (
          <li key={id} data-visible={visible}>
            <label>
              <input
                type="checkbox"
                checked={visible}
                disabled={visible && visibles.length === 1}
                onChange={() => alternar(id)}
              />
              <span>{cabecera}</span>
            </label>
            {visible && (
              <span className="selector-columnas-mover">
                <button
                  type="button"
                  aria-label={`Subir ${cabecera}`}
                  aria-disabled={posicion === 0}
                  onClick={() => mover(id, cabecera, -1)}
                >
                  <QIcono nombre="arriba" tamaño="xs" />
                </button>
                <button
                  type="button"
                  aria-label={`Bajar ${cabecera}`}
                  aria-disabled={posicion === visibles.length - 1}
                  onClick={() => mover(id, cabecera, 1)}
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
 * Botón del final de la cabecera de la tabla: qué columnas se ven y en qué
 * orden, guardar la ordenación actual como predeterminada y restaurar.
 */
export const SelectorColumnas = ({
  catalogo,
  visibles,
  personalizada,
  puedeGuardarOrden,
  onCambiar,
  onGuardarOrden,
  onRestaurar,
}: {
  /** Todas las columnas de la tabla, en el orden del código. */
  catalogo: ColumnaSelector[];
  /** Ids visibles, en el orden en que se ven. */
  visibles: string[];
  /** El usuario tiene la vista personalizada (se puede restaurar). */
  personalizada: boolean;
  /** La ordenación actual no es la guardada. */
  puedeGuardarOrden: boolean;
  onCambiar: (visibles: string[]) => void;
  onGuardarOrden: () => void;
  onRestaurar: () => void;
}) => {
  const boton = useRef<HTMLButtonElement>(null);
  const [abierto, setAbierto] = useState(false);
  const cerrar = useCallback(() => setAbierto(false), []);

  return (
    <>
      <button
        ref={boton}
        type="button"
        className="selector-columnas-boton"
        data-personalizada={personalizada}
        aria-label={personalizada ? "Columnas (vista personalizada)" : "Columnas"}
        title={personalizada ? "Columnas · vista personalizada" : "Columnas"}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        onClick={(e) => {
          e.stopPropagation();
          setAbierto(!abierto);
        }}
      >
        <QIcono nombre="columnas" tamaño="sm" />
      </button>
      {abierto && boton.current && (
        <MenuFlotante
          ancla={boton.current}
          onCerrar={cerrar}
          alineacion="derecha"
          etiqueta="Columnas"
          rol="dialog"
        >
          <div className="selector-columnas">
            <ListaColumnas catalogo={catalogo} visibles={visibles} onCambiar={onCambiar} />
            <div className="selector-columnas-pie">
              <button type="button" disabled={!puedeGuardarOrden} onClick={onGuardarOrden}>
                Guardar ordenación actual como predeterminada
              </button>
              <button
                type="button"
                disabled={!personalizada}
                onClick={() => {
                  onRestaurar();
                  cerrar();
                }}
              >
                Restaurar vista por defecto
              </button>
            </div>
          </div>
        </MenuFlotante>
      )}
    </>
  );
};
