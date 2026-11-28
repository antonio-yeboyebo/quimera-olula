import { useCallback, useState } from 'react';
import { ConfiguracionSeleccion, EstadoSeleccion } from './tipos';
import { useTComponentes } from "../i18n/textos.ts";

/**
 * Hook para manejar la selección de fechas en el calendario
 * Funciona de forma genérica para cualquier aplicación empresarial
 */
export function useSeleccionFechas(configuracion?: ConfiguracionSeleccion) {
  const t = useTComponentes();
  const [seleccion, setSeleccion] = useState<EstadoSeleccion>({
    tipo: configuracion?.tipo || 'simple',
    fechas: [],
    esValida: true,
  });

  // Validar si una fecha puede ser seleccionada
  const esFechaValida = useCallback((fecha: Date): boolean => {
    if (!configuracion) return true;

    // Verificar fechas deshabilitadas
    if (configuracion.fechasDeshabilitadas) {
      const fechaStr = fecha.toISOString().split('T')[0];
      const fechasDeshabilitadasStr = configuracion.fechasDeshabilitadas.map(f =>
        f.toISOString().split('T')[0]
      );
      if (fechasDeshabilitadasStr.includes(fechaStr)) {
        return false;
      }
    }

    return true;
  }, [configuracion]);

  // Validar selección completa
  const validarSeleccion = useCallback((fechas: Date[]): { esValida: boolean; error?: string } => {
    if (!configuracion) return { esValida: true };

    // Validar número mínimo/máximo de días
    if (configuracion.minDias && fechas.length < configuracion.minDias) {
      return {
        esValida: false,
        error: configuracion.mensajeError || t("ui.calendario.seleccionaAlMenosMindiasDias", { minDias: configuracion.minDias })
      };
    }

    if (configuracion.maxDias && fechas.length > configuracion.maxDias) {
      return {
        esValida: false,
        error: configuracion.mensajeError || t("ui.calendario.maximoMaxdiasDiasPermitidos", { maxDias: configuracion.maxDias })
      };
    }

    // Validador personalizado
    if (configuracion.validador && !configuracion.validador(fechas)) {
      return {
        esValida: false,
        error: configuracion.mensajeError || t("ui.calendario.seleccionNoValida")
      };
    }

    return { esValida: true };
  }, [configuracion, t]);

  // Obtener rango de fechas entre dos fechas, excluyendo fechas deshabilitadas
  const obtenerRangoFechas = useCallback((inicio: Date, fin: Date): Date[] => {
    const fechas: Date[] = [];
    const fechaActual = new Date(inicio);
    const fechaFinal = new Date(fin);

    while (fechaActual <= fechaFinal) {
      const fechaParaAgregar = new Date(fechaActual);
      // Solo agregar si la fecha es válida (no está deshabilitada)
      if (esFechaValida(fechaParaAgregar)) {
        fechas.push(fechaParaAgregar);
      }
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return fechas;
  }, [esFechaValida]);

  // Manejar clic en una fecha
  const manejarClickFecha = useCallback((fecha: Date) => {
    if (!esFechaValida(fecha)) return;

    const fechaStr = fecha.toISOString().split('T')[0];
    const tipo = configuracion?.tipo || 'simple';

    setSeleccion(prev => {
      let nuevasFechas: Date[] = [];
      let fechaInicio: Date | undefined;
      let fechaFin: Date | undefined;

      switch (tipo) {
        case 'simple':
          nuevasFechas = [fecha];
          fechaInicio = fecha;
          fechaFin = fecha;
          break;

        case 'multiple': {
          const fechaYaSeleccionada = prev.fechas.some(f =>
            f.toISOString().split('T')[0] === fechaStr
          );

          if (fechaYaSeleccionada) {
            // Deseleccionar fecha
            nuevasFechas = prev.fechas.filter(f =>
              f.toISOString().split('T')[0] !== fechaStr
            );
          } else {
            // Agregar fecha
            nuevasFechas = [...prev.fechas, fecha];
          }

          if (nuevasFechas.length > 0) {
            const fechasOrdenadas = nuevasFechas.sort((a, b) => a.getTime() - b.getTime());
            fechaInicio = fechasOrdenadas[0];
            fechaFin = fechasOrdenadas[fechasOrdenadas.length - 1];
          }
          break;
        }

        case 'rango':
          if (prev.fechas.length === 0 || prev.fechas.length === 2) {
            // Iniciar nuevo rango
            nuevasFechas = [fecha];
            fechaInicio = fecha;
          } else if (prev.fechas.length === 1) {
            // Completar rango
            const [fechaExistente] = prev.fechas;
            const inicio = fecha < fechaExistente ? fecha : fechaExistente;
            const fin = fecha < fechaExistente ? fechaExistente : fecha;

            // Obtener todas las fechas del rango, excluyendo automáticamente las deshabilitadas
            nuevasFechas = obtenerRangoFechas(inicio, fin);
            fechaInicio = inicio;
            fechaFin = fin;
          }
          break;
      }

      const validacion = validarSeleccion(nuevasFechas);

      return {
        tipo,
        fechas: nuevasFechas,
        fechaInicio,
        fechaFin,
        esValida: validacion.esValida,
        error: validacion.error,
      };
    });
  }, [configuracion, esFechaValida, validarSeleccion, obtenerRangoFechas]);

  // Limpiar selección
  const limpiarSeleccion = useCallback(() => {
    setSeleccion({
      tipo: configuracion?.tipo || 'simple',
      fechas: [],
      esValida: true,
    });
  }, [configuracion]);

  // Verificar si una fecha está seleccionada
  const esFechaSeleccionada = useCallback((fecha: Date): boolean => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return seleccion.fechas.some(f => f.toISOString().split('T')[0] === fechaStr);
  }, [seleccion.fechas]);

  return {
    seleccion,
    manejarClickFecha,
    limpiarSeleccion,
    esFechaSeleccionada,
    esFechaValida,
  };
}
