import { ReactNode, useId } from "react";
import { ConfigTarjeta } from "./diseño.ts";
import { MAXIMO_CAMPOS_TARJETA } from "./dominio.ts";
import { ColumnaSelector, ListaColumnas } from "./SelectorColumnas.tsx";

type Modo = "tabla" | "tarjetas" | "kanban";

const NOMBRE_MODO: Record<Modo, string> = {
  tabla: "Tabla",
  tarjetas: "Tarjetas",
  kanban: "Kanban",
};

const HUECOS = [
  { hueco: "titulo", etiqueta: "Título" },
  { hueco: "subtitulo", etiqueta: "Subtítulo" },
  { hueco: "etiqueta", etiqueta: "Etiqueta" },
] as const;

/** Huecos de la plantilla de tarjeta, rellenos con columnas del catálogo. */
const EditorTarjeta = ({
  catalogo,
  tarjeta,
  onCambiar,
}: {
  catalogo: ColumnaSelector[];
  tarjeta?: ConfigTarjeta;
  onCambiar: (tarjeta: ConfigTarjeta | undefined) => void;
}) => {
  const actual: ConfigTarjeta = tarjeta ?? { campos: [] };
  const opciones = (
    <>
      <option value="">—</option>
      {catalogo.map(({ id, cabecera }) => (
        <option key={id} value={id}>
          {cabecera}
        </option>
      ))}
    </>
  );

  const cambiarHueco = (hueco: "titulo" | "subtitulo" | "etiqueta", id: string) =>
    onCambiar({ ...actual, [hueco]: id || undefined });

  const cambiarCampo = (posicion: number, id: string) => {
    const campos = [...actual.campos];
    campos[posicion] = id;
    onCambiar({ ...actual, campos: campos.filter(Boolean) });
  };

  return (
    <>
      {HUECOS.map(({ hueco, etiqueta }) => (
        <label key={hueco} className="panel-personalizar-campo">
          <span>{etiqueta}</span>
          <select value={actual[hueco] ?? ""} onChange={(e) => cambiarHueco(hueco, e.target.value)}>
            {opciones}
          </select>
        </label>
      ))}
      {/* Un campo más que los elegidos (hasta el máximo): van seguidos. */}
      {Array.from(
        { length: Math.min(actual.campos.length + 1, MAXIMO_CAMPOS_TARJETA) },
        (_, posicion) => (
          <label key={posicion} className="panel-personalizar-campo">
            <span>Campo {posicion + 1}</span>
            <select
              value={actual.campos[posicion] ?? ""}
              onChange={(e) => cambiarCampo(posicion, e.target.value)}
            >
              {opciones}
            </select>
          </label>
        )
      )}
      <button
        type="button"
        className="panel-personalizar-enlace"
        disabled={!tarjeta}
        onClick={() => onCambiar(undefined)}
      >
        Quitar plantilla de tarjeta
      </button>
    </>
  );
};

/**
 * Sección del listado en el panel «Personalizar pantalla»: modo, columnas,
 * plantilla de tarjeta, widgets y restaurar.
 */
export const SeccionListado = ({
  modos,
  modo,
  onCambiarModo,
  columnas,
  tarjeta,
  onCambiarTarjeta,
  onPersonalizarWidgets,
  personalizada,
  onRestaurar,
  bloqueada = false,
  compartir,
}: {
  /** Modos entre los que puede elegir (vacío si la pantalla lo fija). */
  modos: Modo[];
  modo: Modo | null;
  onCambiarModo: (modo: Modo) => void;
  columnas?: {
    catalogo: ColumnaSelector[];
    visibles: string[];
    onCambiar: (visibles: string[]) => void;
  };
  tarjeta?: ConfigTarjeta;
  onCambiarTarjeta?: (tarjeta: ConfigTarjeta | undefined) => void;
  onPersonalizarWidgets?: () => void;
  personalizada: boolean;
  onRestaurar: () => void;
  /** La empresa o el grupo han fijado la pantalla. */
  bloqueada?: boolean;
  /** Sección «Compartir», para quien administra las vistas. */
  compartir?: ReactNode;
}) => {
  const nombreGrupo = useId();
  return (
  <>
    {modos.length > 1 && (
      <fieldset className="panel-personalizar-opciones">
        <legend>Ver como</legend>
        {modos.map((m) => (
          <label key={m}>
            <input
              type="radio"
              name={nombreGrupo}
              checked={modo === m}
              onChange={() => onCambiarModo(m)}
            />
            {NOMBRE_MODO[m]}
          </label>
        ))}
      </fieldset>
    )}

    {columnas && (
      <>
        <h4>Columnas</h4>
        <div className="selector-columnas">
          <ListaColumnas {...columnas} />
        </div>
      </>
    )}

    {columnas && onCambiarTarjeta && (
      <>
        <h4>Tarjeta</h4>
        {modo === "tarjetas" ? (
          <>
            <p className="panel-personalizar-ayuda">
              Título y subtítulo arriba, la etiqueta a la derecha y hasta{" "}
              {MAXIMO_CAMPOS_TARJETA} campos debajo.
            </p>
            <EditorTarjeta
              catalogo={columnas.catalogo}
              tarjeta={tarjeta}
              onCambiar={onCambiarTarjeta}
            />
          </>
        ) : (
          <p className="panel-personalizar-ayuda">
            La tarjeta se ve en el modo Tarjetas.{" "}
            {modos.includes("tarjetas") && (
              <button
                type="button"
                className="panel-personalizar-enlace"
                onClick={() => onCambiarModo("tarjetas")}
              >
                Ver como tarjetas
              </button>
            )}
          </p>
        )}
      </>
    )}

    {onPersonalizarWidgets && (
      <>
        <h4>Widgets del resumen</h4>
        <button type="button" className="panel-personalizar-enlace" onClick={onPersonalizarWidgets}>
          Personalizar widgets…
        </button>
      </>
    )}

    {columnas ? (
      <button
        type="button"
        className="panel-personalizar-enlace"
        disabled={!personalizada}
        onClick={onRestaurar}
      >
        Restaurar listado por defecto
      </button>
    ) : (
      bloqueada && (
        <p className="panel-personalizar-ayuda">
          La empresa ha fijado esta pantalla: no se puede personalizar.
        </p>
      )
    )}

    {compartir}
  </>
  );
};
