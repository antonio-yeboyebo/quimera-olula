import { DatoBase } from './tipos';
import { tComponentes } from "../i18n/textos.ts";

export const esHoy = (fecha: Date) => fecha.toDateString() === new Date().toDateString();

export const esMesActual = (fecha: Date, mesReferencia: Date) =>
  fecha.getMonth() === mesReferencia.getMonth() &&
  fecha.getFullYear() === mesReferencia.getFullYear();

export const formatearMes = (fecha: Date) =>
  fecha.toLocaleDateString('es-ES', { month: 'long' }).charAt(0).toUpperCase() +
  fecha.toLocaleDateString('es-ES', { month: 'long' }).slice(1);

export const formatearMesAño = (fecha: Date) =>
  `${formatearMes(fecha)} ${fecha.getFullYear()}`;

export const getDiasDelMes = (fecha: Date) => {
  const año = fecha.getFullYear();
  const mes = fecha.getMonth();
  const dias = new Date(año, mes + 1, 0).getDate();
  return Array.from({ length: dias }, (_, i) => new Date(año, mes, i + 1));
};

export const getDatosPorFecha = <T extends DatoBase>(datos: T[], fecha: Date) =>
  datos.filter(e => {
    const fechaDato = typeof e.fecha === 'string' ? new Date(e.fecha) : e.fecha;
    return fechaDato.toDateString() === fecha.toDateString();
  });

export const getSemanasDelMes = (fecha: Date, inicioSemana: 'lunes' | 'domingo' = 'lunes') => {
  const primerDiaMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  const ultimoDiaMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);

  // Ajuste para comenzar en lunes
  const primerDiaCalendario = new Date(primerDiaMes);
  const diaSemana = primerDiaMes.getDay();

  if (inicioSemana === 'lunes') {
    const diferencia = diaSemana === 0 ? 6 : diaSemana - 1;
    primerDiaCalendario.setDate(primerDiaMes.getDate() - diferencia);
  } else {
    primerDiaCalendario.setDate(primerDiaMes.getDate() - diaSemana);
  }

  const semanas: Date[][] = [];
  const diaActual = new Date(primerDiaCalendario);

  // Filtramos semanas que no contengan días del mes actual
  while (diaActual <= ultimoDiaMes) {
    const semana: Date[] = [];
    let contieneDiasDelMes = false;

    // Primera pasada: verificar si la semana tiene días del mes
    for (let i = 0; i < 7; i++) {
      const diaVerificar = new Date(diaActual);
      diaVerificar.setDate(diaActual.getDate() + i);
      if (diaVerificar.getMonth() === fecha.getMonth()) {
        contieneDiasDelMes = true;
        break;
      }
    }

    // Segunda pasada: agregar semana si tiene días del mes
    if (contieneDiasDelMes) {
      for (let i = 0; i < 7; i++) {
        semana.push(new Date(diaActual));
        diaActual.setDate(diaActual.getDate() + 1);
      }
      semanas.push(semana);
    } else {
      // Saltar semana completa si no tiene días del mes
      diaActual.setDate(diaActual.getDate() + 7);
    }
  }

  return semanas;
};

export const getDiasSemana = (inicioSemana: 'lunes' | 'domingo' = 'lunes') =>
  inicioSemana === 'lunes'
    ? [tComponentes("ui.calendario.lun"), tComponentes("ui.calendario.mar"), tComponentes("ui.calendario.mie"), tComponentes("ui.calendario.jue"), tComponentes("ui.calendario.vie"), tComponentes("ui.calendario.sab"), tComponentes("ui.calendario.dom")]
    : [tComponentes("ui.calendario.dom"), tComponentes("ui.calendario.lun"), tComponentes("ui.calendario.mar"), tComponentes("ui.calendario.mie"), tComponentes("ui.calendario.jue"), tComponentes("ui.calendario.vie"), tComponentes("ui.calendario.sab")];

// Helpers para modo semana
export const getSemanaActual = (fecha: Date, inicioSemana: 'lunes' | 'domingo' = 'lunes') => {
  const dia = new Date(fecha);
  const diaSemana = dia.getDay();

  // Calcular el primer día de la semana
  let diferencia;
  if (inicioSemana === 'lunes') {
    diferencia = diaSemana === 0 ? 6 : diaSemana - 1;
  } else {
    diferencia = diaSemana;
  }

  const primerDiaSemana = new Date(dia);
  primerDiaSemana.setDate(dia.getDate() - diferencia);

  // Generar array con los 7 días de la semana
  return Array.from({ length: 7 }, (_, i) => {
    const nuevoDia = new Date(primerDiaSemana);
    nuevoDia.setDate(primerDiaSemana.getDate() + i);
    return nuevoDia;
  });
};

export const formatearSemana = (fecha: Date) => {
  const diasSemana = getSemanaActual(fecha);
  const primerDia = diasSemana[0];
  const ultimoDia = diasSemana[6];

  const formatearDia = (dia: Date) => dia.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  });

  return `${formatearDia(primerDia)} - ${formatearDia(ultimoDia)}`;
};

export const esSemanaActual = (fecha: Date, semanaReferencia: Date) => {
  const semanaFecha = getSemanaActual(fecha);
  const semanaRef = getSemanaActual(semanaReferencia);
  return semanaFecha[0].toDateString() === semanaRef[0].toDateString();
};
