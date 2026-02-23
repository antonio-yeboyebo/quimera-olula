import { getSchemas } from "quimera";
import { applyBunch, shortcutsBunch, shortcutsState } from "quimera/lib";

import data from "./LineaAlbaranCliNueva.ctrl.yaml";

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
    onLineaBufferReferenciaChanged: [
      {
        type: "setStateKey",
        plug: payload => ({ path: "linea.buffer.referencia", value: payload.value }),
      },
      {
        type: "get",
        schema: () => getSchemas().lineasAlbaranesCli,
        id: () => "-static-",
        action: "buffer_changed",
        params: (payload, state) => {
          const schema = getSchemas().lineasAlbaranesCli;

          return {
            change: JSON.stringify(schema.dump({ referencia: payload.value }, { partial: true })),
            buffer: JSON.stringify(
              schema.dump(state.linea.buffer, {
                partial: true,
                includeNullish: false,
              }),
            ),
          };
        },
        success: "onLineaBufferChangedSucceded_",
      },
    ],
    onLineaBufferChangedSucceded_: [
      {
        type: "setStateKey",
        plug: ({ response }, state) => ({
          path: "linea.buffer",
          value: { ...state.linea.buffer, ...response.data },
        }),
      },
    ],
  };
};
