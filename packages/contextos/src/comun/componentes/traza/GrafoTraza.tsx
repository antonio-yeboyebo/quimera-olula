import { formatearFechaString } from "@olula/lib/dominio.ts";
import { KeyboardEvent, useMemo } from "react";
import { GrafoTraza as Grafo } from "./diseño.ts";
import { etiquetaNodo, layoutPorColumnas, nombreTipo } from "./dominio.ts";
import { useTComun } from "../../i18n/index.ts";

const NODO_ANCHO = 156;
const NODO_ALTO = 48;
const HUECO_X = 56;
const HUECO_Y = 12;
const CABECERA = 28;
const MARGEN = 4;

type Posicion = { x: number; y: number };

export const GrafoTraza = ({
  grafo,
  seleccionado,
  onSeleccionar,
}: {
  grafo: Grafo;
  seleccionado: string;
  onSeleccionar: (clave: string) => void;
}) => {
  const t = useTComun();
  const columnas = useMemo(() => layoutPorColumnas(grafo), [grafo]);

  const posiciones = useMemo(() => {
    const mapa = new Map<string, Posicion>();
    columnas.forEach((columna, indiceColumna) =>
      columna.nodos.forEach((nodo) =>
        mapa.set(nodo.clave, {
          x: MARGEN + indiceColumna * (NODO_ANCHO + HUECO_X),
          y: CABECERA + nodo.fila * (NODO_ALTO + HUECO_Y),
        })
      )
    );
    return mapa;
  }, [columnas]);

  const filas = 1 + Math.max(...columnas.flatMap((columna) => columna.nodos.map((nodo) => nodo.fila)));
  const ancho = 2 * MARGEN + columnas.length * NODO_ANCHO + (columnas.length - 1) * HUECO_X;
  const alto = CABECERA + filas * (NODO_ALTO + HUECO_Y) - HUECO_Y + MARGEN;

  const alTeclear = (clave: string) => (evento: KeyboardEvent) => {
    if (evento.key !== "Enter" && evento.key !== " ") return;
    evento.preventDefault();
    onSeleccionar(clave);
  };

  return (
    <div className="traza-grafo">
      <svg
        width={ancho}
        height={alto}
        viewBox={`0 0 ${ancho} ${alto}`}
        role="group"
        aria-label={t("componentes.grafoDeDocumentosRelacionados")}
      >
        {columnas.map((columna, indice) => (
          <text
            key={columna.id}
            className="traza-columna"
            x={MARGEN + indice * (NODO_ANCHO + HUECO_X) + NODO_ANCHO / 2}
            y={CABECERA - 12}
            textAnchor="middle"
          >
            {columna.titulo}
          </text>
        ))}

        {grafo.aristas.map(({ desde, hasta }) => {
          const origen = posiciones.get(desde);
          const destino = posiciones.get(hasta);
          if (!origen || !destino) return null;

          const x1 = origen.x + NODO_ANCHO;
          const y1 = origen.y + NODO_ALTO / 2;
          const x2 = destino.x;
          const y2 = destino.y + NODO_ALTO / 2;
          const medio = (x1 + x2) / 2;
          const activa = desde === seleccionado || hasta === seleccionado;

          return (
            <path
              key={`${desde}>${hasta}`}
              className={`traza-arista${activa ? " activa" : ""}`}
              d={`M ${x1} ${y1} C ${medio} ${y1}, ${medio} ${y2}, ${x2} ${y2}`}
            />
          );
        })}

        {columnas.flatMap((columna) =>
          columna.nodos.map(({ clave, datos }) => {
            const posicion = posiciones.get(clave)!;
            const clases = [
              "traza-nodo",
              clave === grafo.raiz ? "raiz" : "",
              clave === seleccionado ? "seleccionado" : "",
              datos.visible ? "" : "oculto",
            ].filter(Boolean).join(" ");
            const etiqueta = etiquetaNodo(datos);
            const detalle = !datos.visible
              ? t("componentes.sinAcceso")
              : datos.tipo === "pago_cobro"
                ? datos.codigo
                : datos.fecha
                  ? formatearFechaString(datos.fecha)
                  : "";

            return (
              <g
                key={clave}
                className={clases}
                transform={`translate(${posicion.x} ${posicion.y})`}
                role="button"
                tabIndex={0}
                aria-pressed={clave === seleccionado}
                aria-label={`${nombreTipo(datos.tipo)} ${etiqueta}`}
                onClick={() => onSeleccionar(clave)}
                onKeyDown={alTeclear(clave)}
              >
                <title>{`${nombreTipo(datos.tipo)} ${etiqueta}`}</title>
                <rect width={NODO_ANCHO} height={NODO_ALTO} rx={6} />
                <text className="traza-nodo-codigo" x={10} y={20}>
                  {etiqueta}
                </text>
                <text className="traza-nodo-detalle" x={10} y={37}>
                  {detalle}
                </text>
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
};
