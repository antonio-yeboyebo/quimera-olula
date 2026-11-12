import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { useState } from "react";
import { NumeroTrimestre, Periodo } from "../diseño.ts";
import { rangoPeriodo } from "../dominio.ts";
import "./SelectorPeriodo.css";

type SelectorPeriodoProps = {
    periodo: Periodo;
    onChange: (periodo: Periodo) => void;
    soloTrimestres?: boolean;
    años?: number[];
};

type Modo = "trimestre" | "año" | "historico";

const NUMEROS: NumeroTrimestre[] = [1, 2, 3, 4];

const textoModo: Record<Modo, string> = {
    trimestre: "Trimestre",
    año: "Año",
    historico: "Histórico",
};

const añosPorDefecto = () => {
    const actual = new Date().getFullYear();
    return [actual, actual - 1, actual - 2];
};

const modoInicial = (periodo: Periodo): Modo =>
    periodo.tipo === "fechas" ? "historico" : periodo.trimestres.length === 4 ? "año" : "trimestre";

export const SelectorPeriodo = ({
    periodo,
    onChange,
    soloTrimestres = false,
    años = añosPorDefecto(),
}: SelectorPeriodoProps) => {
    const [modo, setModo] = useState<Modo>(() => modoInicial(periodo));
    const rango = rangoPeriodo(periodo);
    const año =
        periodo.tipo === "trimestres"
            ? (periodo.trimestres[0]?.año ?? años[0])
            : Number((rango?.desde ?? "").slice(0, 4)) || años[0];
    const marcados = periodo.tipo === "trimestres" ? periodo.trimestres.map((t) => t.numero) : [];
    const modos: Modo[] = soloTrimestres ? ["trimestre", "año"] : ["trimestre", "año", "historico"];

    const deAño = (nuevo: number, numeros: NumeroTrimestre[]): Periodo => ({
        tipo: "trimestres",
        trimestres: [...numeros].sort().map((numero) => ({ año: nuevo, numero })),
    });

    const cambiarModo = (nuevo: Modo) => {
        setModo(nuevo);
        if (nuevo === "historico") {
            onChange({ tipo: "fechas", desde: rango?.desde ?? "", hasta: rango?.hasta ?? "" });
        } else if (nuevo === "año") {
            onChange(deAño(año, NUMEROS));
        } else {
            const actual = (Math.floor(new Date().getMonth() / 3) + 1) as NumeroTrimestre;
            onChange(deAño(año, [actual]));
        }
    };

    const cambiarTrimestre = (numero: NumeroTrimestre) =>
        onChange(deAño(año, marcados.includes(numero) ? marcados.filter((n) => n !== numero) : [...marcados, numero]));

    const cambiarAño = (nuevo: number) => onChange(deAño(nuevo, modo === "año" ? NUMEROS : marcados.length ? marcados : [1]));

    const selectorAño = (
        <QSelect
            label="Año"
            nombre="periodo_año"
            valor={String(año)}
            opciones={años.map((a) => ({ valor: String(a), descripcion: String(a) }))}
            onChange={(opcion) => opcion && cambiarAño(Number(opcion.valor))}
        />
    );

    return (
        <div className="SelectorPeriodo">
            <div className="pestañas" role="tablist">
                {modos.map((valor) => (
                    <button key={valor} type="button" role="tab" aria-selected={modo === valor} onClick={() => cambiarModo(valor)}>
                        {textoModo[valor]}
                    </button>
                ))}
            </div>

            {modo === "trimestre" && (
                <div className="filtro">
                    {selectorAño}
                    <div className="trimestres">
                        {NUMEROS.map((numero) => (
                            <button
                                key={numero}
                                type="button"
                                aria-pressed={marcados.includes(numero)}
                                onClick={() => cambiarTrimestre(numero)}
                            >
                                T{numero}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {modo === "año" && <div className="filtro">{selectorAño}</div>}

            {modo === "historico" && periodo.tipo === "fechas" && (
                <div className="filtro">
                    <QDate label="Desde" nombre="periodo_desde" valor={periodo.desde} onChange={(desde) => onChange({ ...periodo, desde })} />
                    <QDate label="Hasta" nombre="periodo_hasta" valor={periodo.hasta} onChange={(hasta) => onChange({ ...periodo, hasta })} />
                </div>
            )}
        </div>
    );
};
