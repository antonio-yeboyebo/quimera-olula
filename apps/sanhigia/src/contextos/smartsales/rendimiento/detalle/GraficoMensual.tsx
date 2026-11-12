import { MesHistorico } from "../diseño.ts";
import { maximoHistorico } from "../dominio.ts";

const NOMBRES_MES = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const altura = (valor: number, maximo: number) => `${maximo > 0 ? (valor * 100) / maximo : 0}%`;

const descripcionMes = (mes: MesHistorico) =>
    [
        mes.mes,
        mes.ventas !== null && `ventas ${euros.format(mes.ventas)}`,
        mes.prevision !== null && `previsión ${euros.format(mes.prevision)}`,
        `objetivo ${euros.format(mes.objetivo)}`,
    ]
        .filter(Boolean)
        .join(", ");

export const GraficoMensual = ({ meses }: { meses: MesHistorico[] }) => {
    const maximo = maximoHistorico(meses);

    return (
        <figure className="GraficoMensual">
            <div className="columnas">
                {meses.map((mes, i) => (
                    <div key={mes.mes} className="columna" title={descripcionMes(mes)} role="img" aria-label={descripcionMes(mes)}>
                        <div className="zona">
                            {mes.ventas !== null && <div className="barra ventas" style={{ height: altura(mes.ventas, maximo) }} />}
                            {mes.ventas === null && mes.prevision !== null && (
                                <div className="barra prevision" style={{ height: altura(mes.prevision, maximo) }} />
                            )}
                            {mes.objetivo > 0 && <div className="objetivo" style={{ bottom: altura(mes.objetivo, maximo) }} />}
                        </div>
                        <span className="mes">{NOMBRES_MES[i]}</span>
                    </div>
                ))}
            </div>
            <figcaption className="leyenda">
                <span className="clave ventas">Ventas</span>
                <span className="clave prevision">Previsión</span>
                <span className="clave objetivo">Objetivo</span>
            </figcaption>
        </figure>
    );
};
