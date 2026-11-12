import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { COLORES_SERIE } from "@olula/componentes/tema/colores_graficos.ts";
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
import { Arbol, Medida, PeticionPivot, TipoGrafico } from "../../diseño.ts";
import { datosGrafico, graficable } from "../../dominio.ts";

type GraficoProps = {
    arbol: Arbol;
    medida: Medida;
    peticion: PeticionPivot;
    tipo: TipoGrafico;
    onTipo: (tipo: TipoGrafico) => void;
};

const TIPOS: { tipo: TipoGrafico; texto: string }[] = [
    { tipo: "barras", texto: "Barras" },
    { tipo: "lineas", texto: "Líneas" },
    { tipo: "tarta", texto: "Tarta" },
];

const color = (i: number) => COLORES_SERIE[i % COLORES_SERIE.length];

export const Grafico = ({ arbol, medida, peticion, tipo, onTipo }: GraficoProps) => {
    if (!graficable(peticion)) {
        return (
            <p className="analisis-vacio">
                El gráfico necesita un nivel en filas y como mucho uno en columnas.
            </p>
        );
    }

    const { puntos, series } = datosGrafico(arbol, medida, peticion.columnas.length);
    const formatear = (valor: unknown) => Number(valor).toLocaleString("es-ES");

    return (
        <div className="analisis-grafico">
            <div className="analisis-grafico-tipos">
                {TIPOS.map((t) => (
                    <QBoton
                        key={t.tipo}
                        tamaño="pequeño"
                        variante={t.tipo === tipo ? "solido" : "borde"}
                        onClick={() => onTipo(t.tipo)}
                    >
                        {t.texto}
                    </QBoton>
                ))}
                <span className="analisis-carga">{medida.descripcion}</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                {tipo === "tarta" ? (
                    <PieChart>
                        <Tooltip formatter={formatear} />
                        <Legend />
                        <Pie data={puntos} dataKey={series[0].clave} nameKey="etiqueta" outerRadius="80%">
                            {puntos.map((_, i) => (
                                <Cell key={i} fill={color(i)} />
                            ))}
                        </Pie>
                    </PieChart>
                ) : tipo === "lineas" ? (
                    <LineChart data={puntos}>
                        <CartesianGrid vertical={false} strokeOpacity={0.4} />
                        <XAxis dataKey="etiqueta" tickLine={false} />
                        <YAxis tickFormatter={formatear} tickLine={false} axisLine={false} />
                        <Tooltip formatter={formatear} />
                        {series.length > 1 && <Legend />}
                        {series.map((s, i) => (
                            <Line key={s.clave} dataKey={s.clave} name={s.nombre} stroke={color(i)} strokeWidth={2} />
                        ))}
                    </LineChart>
                ) : (
                    <BarChart data={puntos}>
                        <CartesianGrid vertical={false} strokeOpacity={0.4} />
                        <XAxis dataKey="etiqueta" tickLine={false} />
                        <YAxis tickFormatter={formatear} tickLine={false} axisLine={false} />
                        <Tooltip formatter={formatear} />
                        {series.length > 1 && <Legend />}
                        {series.map((s, i) => (
                            <Bar key={s.clave} dataKey={s.clave} name={s.nombre} fill={color(i)} />
                        ))}
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};
