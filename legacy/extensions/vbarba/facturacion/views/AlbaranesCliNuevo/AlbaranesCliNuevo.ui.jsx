import { Grid, Icon, QSection } from "@quimera/comps";
import { CircularProgress } from "@quimera/thirdparty";
import { DirCliente } from "@quimera-extension/base-ventas";
import Quimera, { getSchemas, PropValidation, useStateValue, util } from "quimera";
import React, { useEffect } from "react";

import { Cliente } from "../../comps";

function AlbaranesCliNuevo({ callbackGuardado, useStyles, ...props }) {
  const [{ albaran, savingAlbaran }, dispatch] = useStateValue();
  const schema = getSchemas().albaranCliNuevo;
  // const classes = useStyles()

  useEffect(() => {
    dispatch({
      type: "onInit",
      payload: {
        callbackAlbaranChanged: callbackGuardado,
        ...props,
      },
    });
  }, [callbackGuardado]);

  useEffect(() => {
    util.publishEvent(albaran.event, callbackGuardado);
  }, [albaran.event.serial]);

  return (
    <Quimera.Template id="AlbaranesCliNuevo">
      <QSection
        actionPrefix="nuevoAlbaran"
        alwaysActive
        dynamicComp={() => (
          <Grid container direction="column" spacing={2}>
            <Grid item xs={12}>
              <Cliente
                id="albaran.buffer/codCliente"
                label={`Cliente ${albaran.buffer.codCliente ?? ""}`}
                fullWidth
                async
                autoFocus
              />
            </Grid>
            <Grid item xs={12} style={{ visibility: "hidden", height: "0px" }}>
              <DirCliente
                id="albaran.buffer/codDir"
                codCliente={albaran.buffer.codCliente}
                label="Dirección"
                disabled
                fullWidth
              />
            </Grid>
          </Grid>
        )}
        saveDisabled={() => !schema.isValid(albaran.buffer)}
        save={{
          text: !savingAlbaran ? "Guardar" : <CircularProgress size={20} />,
          icon: !savingAlbaran ? <Icon>save_alt</Icon> : <></>,
        }}
      ></QSection>
    </Quimera.Template>
  );
}

export default AlbaranesCliNuevo;
