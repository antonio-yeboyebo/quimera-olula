import { COLORES_SERIE } from "../../tema/colores_graficos.ts";
import { DefinicionWidget, PuntoWidget } from "./diseño.ts";
import { formatearValorWidget } from "./dominio.ts";
import "./WidgetCompacto.css";
import { tComponentes } from "../../i18n/textos.ts";

type WidgetCompactoProps = {
  widget: DefinicionWidget;
  valor: number | null | undefined;
  puntos: PuntoWidget[];
  pie: string;
  cargando: boolean;
};

const formatear = (widget: DefinicionWidget, valor: number | null | undefined) =>
  formatearValorWidget(valor, widget);

/** Línea de los últimos meses, normalizada a la caja (sin ejes: es una tendencia). */
const Tendencia = ({ puntos }: { puntos: PuntoWidget[] }) => {
  if (puntos.length < 2) return null;
  const valores = puntos.map((p) => p.valor);
  const minimo = Math.min(...valores);
  const rango = Math.max(...valores) - minimo || 1;
  const trazo = puntos
    .map((p, i) => `${(i / (puntos.length - 1)) * 100},${26 - ((p.valor - minimo) / rango) * 24}`)
    .join(" ");
  return (
    <svg
      className="widget-compacto-tendencia"
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      role="img"
      aria-label={`${puntos[0].etiqueta} a ${puntos[puntos.length - 1].etiqueta}`}
    >
      <polyline points={trazo} fill="none" stroke={COLORES_SERIE[0]} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

/** Meses que abarca la evolución, para saber a qué periodo del filtro corresponde. */
const periodo = (puntos: PuntoWidget[]) =>
  puntos.length === 0
    ? ""
    : puntos.length === 1
      ? puntos[0].etiqueta
      : `${puntos[0].etiqueta} – ${puntos[puntos.length - 1].etiqueta}`;

/** Anillo con las mayores y el resto del total como «Otros». */
const Anillo = ({ puntos, total }: { puntos: PuntoWidget[]; total: number }) => {
  const suma = puntos.reduce((s, p) => s + p.valor, 0);
  const partes = [...puntos, ...(total > suma ? [{ clave: "__otros", etiqueta: tComponentes("ui.maestro.otros"), valor: total - suma }] : [])];
  const base = Math.max(total, suma) || 1;
  let acumulado = 0;
  return (
    <div className="widget-compacto-anillo">
      <svg viewBox="0 0 42 42" aria-hidden="true">
        {partes.map((p, i) => {
          const fraccion = (p.valor / base) * 100;
          const circulo = (
            <circle
              key={p.clave}
              cx="21"
              cy="21"
              r="15.915"
              fill="none"
              stroke={p.clave === "__otros" ? "#c5cbd0" : COLORES_SERIE[i % COLORES_SERIE.length]}
              strokeWidth="7"
              strokeDasharray={`${fraccion} ${100 - fraccion}`}
              strokeDashoffset={25 - acumulado}
            />
          );
          acumulado += fraccion;
          return circulo;
        })}
      </svg>
      <ul>
        {partes.slice(0, 3).map((p) => (
          <li key={p.clave}>
            <strong>{Math.round((p.valor / base) * 100)} %</strong> <span>{p.etiqueta}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Widget de una fila de alto para la zona de widgets de un maestro: tarjeta, evolución,
 * anillo, ranking u objetivo, siempre con el filtro del listado.
 */
export const WidgetCompacto = ({ widget, valor, puntos, pie, cargando }: WidgetCompactoProps) => {
  const tipo = widget.tipo ?? "tarjeta";
  const porcentaje = widget.meta ? Math.round(((valor ?? 0) / widget.meta) * 100) : 0;

  return (
    <quimera-tarjeta-resumen data-cargando={cargando || undefined} data-tipo={tipo}>
      <div className="cabecera">
        <span className="titulo">{widget.titulo}</span>
      </div>

      {tipo === "ranking" ? (
        <ol className="widget-compacto-ranking">
          {puntos.map((p) => (
            <li key={p.clave}>
              <span>{p.etiqueta}</span>
              <strong>{formatear(widget, p.valor)}</strong>
            </li>
          ))}
          {puntos.length === 0 && <li>—</li>}
        </ol>
      ) : tipo === "temporal" ? (
        // La línea a la izquierda del valor (misma altura que una tarjeta); debajo si no cabe.
        <div className="widget-compacto-fila">
          <span className="valor">{formatear(widget, valor)}</span>
          <Tendencia puntos={puntos} />
        </div>
      ) : (
        <span className="valor">
          {tipo === "objetivo" ? `${porcentaje} %` : formatear(widget, valor)}
        </span>
      )}

      {tipo === "circular" && <Anillo puntos={puntos} total={valor ?? 0} />}
      {tipo === "objetivo" && (
        <div
          className="widget-compacto-progreso"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min(porcentaje, 100)}
          aria-label={tComponentes("ui.maestro.porcentajeDelObjetivo", { porcentaje })}
        >
          <div style={{ width: `${Math.min(porcentaje, 100)}%`, background: COLORES_SERIE[0] }} />
        </div>
      )}

      <span className="pie">
        {tipo === "temporal" && periodo(puntos) && (
          <span className="widget-compacto-periodo">{periodo(puntos)}</span>
        )}
        {tipo === "objetivo"
          ? `${formatear(widget, valor)} de ${formatear(widget, widget.meta)}`
          : pie}
      </span>
    </quimera-tarjeta-resumen>
  );
};
