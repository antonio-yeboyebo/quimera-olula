import { applyBunch, shortcutsBunch, shortcutsState } from "quimera/lib";

import data from "./ConfiguracionSofa.ctrl.yaml";

export const state = parent => ({
  ...parent,
  ...shortcutsState(data.shortcuts),
  ...data.state,
});

export const bunch = parent => {
  const parentConShortCuts = {
    ...parent,
    ...shortcutsBunch(data.shortcuts),
  };

  return {
    ...parentConShortCuts,
    ...applyBunch(data.bunch, parentConShortCuts),
    volverCatalogo: [
      {
        type: "function",
        function: (_, { callbackVolver }) => callbackVolver(),
      },
    ],
    reseteaMisConfiguraciones: [
      {
        type: "setStateKey",
        plug: payload => ({ path: "misConfiguraciones", value: [] }),
      },
      {
        type: "grape",
        name: "calculaTotalPrecio",
      },
    ],
    addConfiguracionPorIndice: [
      {
        type: "setStateKey",
        plug: ({ result }, { misConfiguraciones, configuraciones }) => {
          // Cancelación del drag
          if (!result.destination) {
            return { path: "misConfiguraciones", value: misConfiguraciones };
          }
          const { source, destination } = result;
          // Crear copia del array para no mutar el estado
          const auxStatus = [...misConfiguraciones];
          // Remover prefijo "CONFIG_ID_" del draggableId
          // Formato: CONFIG_ID_12345
          const idConfig = result.draggableId.replace(/^CONFIG_ID_/, '');
          const configuracion = configuraciones.dict[idConfig];

          if (!configuracion) {
            console.warn('Configuración no encontrada:', idConfig, 'draggableId:', result.draggableId);
            return { path: "misConfiguraciones", value: misConfiguraciones };
          }

          auxStatus.splice(destination.index, 0, configuracion);
          return { path: "misConfiguraciones", value: auxStatus };
        },
      },
      {
        type: "grape",
        name: "calculaTotalPrecio",
      },
    ],
    recolocaConfiguracion: [
      {
        type: "setStateKey",
        plug: ({ result }, { misConfiguraciones }) => {
          // Cancelación del drag
          if (!result.destination) {
            return { path: "misConfiguraciones", value: misConfiguraciones };
          }

          const { source, destination } = result;

          // Si la posición es la misma, no hacer nada
          if (source.index === destination.index) {
            return { path: "misConfiguraciones", value: misConfiguraciones };
          }

          // Crear copia del array para no mutar el estado
          const auxStatus = [...misConfiguraciones];
          const [removed] = auxStatus.splice(source.index, 1);
          auxStatus.splice(destination.index, 0, removed);

          return { path: "misConfiguraciones", value: auxStatus };
        },
      },
    ],
    onEliminarConfiguracionClicked: [
      {
        type: "setStateKey",
        plug: ({ indice }, { misConfiguraciones }) => {
          // Crear copia del array para no mutar el estado
          const auxStatus = [...misConfiguraciones];
          auxStatus.splice(indice, 1);

          return { path: "misConfiguraciones", value: auxStatus };
        },
      },
      {
        type: "grape",
        name: "calculaTotalPrecio",
      },
    ],
  };
};
