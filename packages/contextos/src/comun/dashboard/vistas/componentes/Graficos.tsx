import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ComponenteDashboard, RespuestaAgregado } from "../../diseño.ts";
import {
  agruparResto,
  categorias,
  formatearCorto,
  formatearValor,
  formatoPorDefecto,
  serieTemporal,
} from "../../dominio.ts";
import { COLOR_COMPARACION, COLORES_SERIE } from "./colores.ts";
import { tComun } from "../../../i18n/index.ts";

type PropsGrafico = {
  componente: ComponenteDashboard;
  respuesta: RespuestaAgregado;
};

const formatoDe = (componente: ComponenteDashboard) =>
  componente.opciones.formato ?? formatoPorDefecto(componente.consultas[0]?.metricas);

/** Nombres largos de cliente o artículo: una línea, recortada (el tooltip da el entero). */
const recortar = (texto: string, maximo = 18) =>
  texto.length > maximo ? `${texto.slice(0, maximo - 1)}…` : texto;

/** Etiqueta del eje de categorías en una sola línea (recharts la partiría en varias). */
const EtiquetaCategoria = ({
  x,
  y,
  payload,
}: {
  x?: number | string;
  y?: number | string;
  payload?: { value: string };
}) => (
  <text x={x} y={y} dy={4} textAnchor="end" className="recharts-cartesian-axis-tick-value">
    <title>{payload?.value}</title>
    {recortar(String(payload?.value ?? ""))}
  </text>
);

const textoComparacion = (componente: ComponenteDashboard) =>
  componente.consultas[0]?.comparar === "periodo_anterior" ? tComun("dashboard.periodoAnterior") : tComun("dashboard.anoAnterior");

/** Evolución en el tiempo, con la serie del otro periodo discontinua si se compara. */
export const Temporal = ({ componente, respuesta }: PropsGrafico) => {
  const consulta = componente.consultas[0];
  const puntos = serieTemporal(respuesta, consulta);
  const formato = formatoDe(componente);
  const compara = Boolean(respuesta.comparacion);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={puntos} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} strokeOpacity={0.4} />
        <XAxis dataKey="etiqueta" tickLine={false} minTickGap={12} />
        <YAxis tickFormatter={formatearCorto} tickLine={false} axisLine={false} width={48} />
        <Tooltip formatter={(valor) => formatearValor(Number(valor), formato)} />
        {compara && <Legend />}
        {compara && (
          <Line
            dataKey="anterior"
            name={textoComparacion(componente)}
            stroke={COLOR_COMPARACION}
            strokeDasharray="5 4"
            strokeWidth={2}
            dot={false}
          />
        )}
        <Line
          dataKey="actual"
          name={tComun("dashboard.actual")}
          stroke={COLORES_SERIE[0]}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * Barras por categoría. `horizontal` (ranking): barras tumbadas y ordenadas, para
 * leer nombres largos de clientes o artículos.
 */
export const Barras = ({
  componente,
  respuesta,
  horizontal = false,
}: PropsGrafico & { horizontal?: boolean }) => {
  const datos = categorias(respuesta, componente.consultas[0]);
  const formato = formatoDe(componente);
  const filas = horizontal ? [...datos].sort((a, b) => b.valor - a.valor) : datos;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={filas}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
      >
        <CartesianGrid
          horizontal={!horizontal}
          vertical={horizontal}
          strokeOpacity={0.4}
        />
        {horizontal ? (
          <>
            <XAxis type="number" tickFormatter={formatearCorto} tickLine={false} />
            <YAxis
              type="category"
              dataKey="etiqueta"
              width={150}
              tickLine={false}
              interval={0}
              tick={EtiquetaCategoria}
            />
          </>
        ) : (
          <>
            <XAxis dataKey="etiqueta" tickLine={false} interval="preserveStartEnd" />
            <YAxis tickFormatter={formatearCorto} tickLine={false} axisLine={false} width={48} />
          </>
        )}
        <Tooltip formatter={(valor) => formatearValor(Number(valor), formato)} />
        <Bar
          dataKey="valor"
          name={componente.titulo || tComun("dashboard.valor")}
          fill={COLORES_SERIE[0]}
          radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          maxBarSize={36}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

/** Reparto en anillo: como mucho 6 porciones (el resto, «Otros»), con leyenda. */
export const Circular = ({ componente, respuesta }: PropsGrafico) => {
  const datos = agruparResto(categorias(respuesta, componente.consultas[0]));
  const formato = formatoDe(componente);
  const total = datos.reduce((suma, c) => suma + c.valor, 0);

  return (
    <div className="dashboard-circular">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={datos}
            dataKey="valor"
            nameKey="etiqueta"
            innerRadius="58%"
            outerRadius="90%"
            paddingAngle={1}
            stroke="none"
            isAnimationActive={false}
          >
            {datos.map((c, i) => (
              <Cell key={c.clave} fill={COLORES_SERIE[i % COLORES_SERIE.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(valor) => formatearValor(Number(valor), formato)} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="dashboard-leyenda">
        {datos.map((c, i) => (
          <li key={c.clave}>
            <span
              className="dashboard-leyenda-color"
              style={{ background: COLORES_SERIE[i % COLORES_SERIE.length] }}
              aria-hidden="true"
            />
            <span className="dashboard-leyenda-texto">{c.etiqueta}</span>
            <span className="dashboard-leyenda-valor">
              {total > 0 ? `${Math.round((c.valor / total) * 100)} %` : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
