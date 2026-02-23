import { Grid, Icon, QSection } from "@quimera/comps";
import { CircularProgress } from "@quimera/thirdparty";
import Quimera, { getSchemas, PropValidation, useStateValue, util } from "quimera";
import { useEffect } from "react";

import { Cliente } from "../../comps";

function PresupuestoCliNuevo({ callbackGuardado, useStyles, ...props }) {
  const [{ presupuesto, savingPresupuesto }, dispatch] = useStateValue();
  const schema = getSchemas().presupuestoCliNuevo;

  useEffect(() => {
    dispatch({
      type: "onInit",
      payload: {
        callbackPresupuestoChanged: callbackGuardado,
        ...props,
      },
    });
  }, [callbackGuardado]);

  useEffect(() => {
    util.publishEvent(presupuesto.event, callbackGuardado);
  }, [presupuesto.event.serial]);

  console.log("mimensaje_presupuesto", savingPresupuesto);

  return (
    <Quimera.Template id="PresupuestoCliNuevo">
      <QSection
        actionPrefix="nuevoPresupuesto"
        alwaysActive
        dynamicComp={() => (
          <Grid container direction="column" spacing={2}>
            <Grid item xs={12}>
              <Cliente
                id="presupuesto.buffer/codCliente"
                label={`Cliente ${presupuesto.buffer.codCliente ?? ""}`}
                fullWidth
                async
                autoFocus
              />
            </Grid>
          </Grid>
        )}
        saveDisabled={() => !schema.isValid(presupuesto.buffer)}
        save={{
          text: !savingPresupuesto ? "Guardar" : <CircularProgress size={20} />,
          icon: !savingPresupuesto ? <Icon>save_alt</Icon> : <></>,
        }}
      ></QSection>
    </Quimera.Template>
  );
}

export default PresupuestoCliNuevo;
