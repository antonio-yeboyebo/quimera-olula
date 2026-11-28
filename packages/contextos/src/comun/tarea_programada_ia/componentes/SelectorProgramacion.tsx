import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import {
    expresionCronDesdeProgramacion, FrecuenciaTarea, OPCIONES_DIA_SEMANA, OPCIONES_FRECUENCIA,
    conHoraDiaDesdeTexto, horaDiaComoTexto, programacionDesdeExpresionCron,
} from "../dominio.js";
import "./SelectorProgramacion.css";
import { tComun } from "../../i18n/index.ts";

interface SelectorProgramacionProps {
    valor: string;
    onChange: (expresionCron: string) => void;
}

/**
 * Reemplaza el campo de texto libre de expresión cron: el usuario elige una
 * frecuencia en lenguaje natural y, si hace falta (cada día/cada semana), una
 * hora y un día de la semana — nunca escribe cron a mano. Componente
 * controlado y sin estado propio: la programación se deriva de `valor`
 * (la expresión cron ya guardada) en cada render.
 */
export const SelectorProgramacion = ({ valor, onChange }: SelectorProgramacionProps) => {
    const programacion = programacionDesdeExpresionCron(valor);

    return (
        <div className="SelectorProgramacion">
            <QSelect
                label={tComun("tareaProgramadaIa.frecuencia")}
                nombre="frecuencia"
                valor={programacion.frecuencia}
                opciones={OPCIONES_FRECUENCIA}
                onChange={(opcion) => onChange(expresionCronDesdeProgramacion({
                    ...programacion,
                    frecuencia: (opcion?.valor as FrecuenciaTarea) ?? programacion.frecuencia,
                }))}
            />

            {(programacion.frecuencia === 'cada_dia' || programacion.frecuencia === 'cada_semana') && (
                <QDate
                    label={tComun("tareaProgramadaIa.hora")}
                    nombre="hora"
                    tipo="hora"
                    valor={horaDiaComoTexto(programacion)}
                    onChange={(horaTexto) => onChange(expresionCronDesdeProgramacion(
                        conHoraDiaDesdeTexto(programacion, horaTexto as string)
                    ))}
                />
            )}

            {programacion.frecuencia === 'cada_semana' && (
                <QSelect
                    label={tComun("tareaProgramadaIa.diaDeLaSemana")}
                    nombre="dia_semana"
                    valor={String(programacion.diaSemana)}
                    opciones={OPCIONES_DIA_SEMANA}
                    onChange={(opcion) => onChange(expresionCronDesdeProgramacion({
                        ...programacion,
                        diaSemana: opcion ? Number(opcion.valor) : programacion.diaSemana,
                    }))}
                />
            )}
        </div>
    );
};
