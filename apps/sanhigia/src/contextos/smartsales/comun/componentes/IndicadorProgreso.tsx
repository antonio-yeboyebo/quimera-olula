import "./IndicadorProgreso.css";

type IndicadorProgresoProps = {
    conseguido: number | null;
    tiempo: number;
    forma?: "circulo" | "barra";
};

const RADIO = 42;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

const limitar = (valor: number) => Math.min(Math.max(valor, 0), 100);

const textoPorcentaje = (valor: number | null) => (valor === null ? "—" : `${Math.round(valor)} %`);

export const IndicadorProgreso = ({ conseguido, tiempo, forma = "barra" }: IndicadorProgresoProps) => {
    const etiqueta = `Conseguido ${textoPorcentaje(conseguido)}, tiempo transcurrido ${textoPorcentaje(tiempo)}`;

    if (forma === "circulo") {
        const trazo = (valor: number) => `${(limitar(valor) * CIRCUNFERENCIA) / 100} ${CIRCUNFERENCIA}`;
        return (
            <div className="IndicadorProgreso circulo" role="img" aria-label={etiqueta}>
                <svg viewBox="0 0 100 100">
                    <circle className="fondo" cx="50" cy="50" r={RADIO} />
                    <circle className="tiempo" cx="50" cy="50" r={RADIO} strokeDasharray={trazo(tiempo)} />
                    <circle className="conseguido" cx="50" cy="50" r={RADIO} strokeDasharray={trazo(conseguido ?? 0)} />
                </svg>
                <span className="valor">{textoPorcentaje(conseguido)}</span>
            </div>
        );
    }

    return (
        <div className="IndicadorProgreso barra" role="img" aria-label={etiqueta}>
            <div className="tiempo" style={{ width: `${limitar(tiempo)}%` }} />
            <div className="conseguido" style={{ width: `${limitar(conseguido ?? 0)}%` }} />
        </div>
    );
};
