import { Grid, Icon, QSection } from "@quimera/comps";
import { CircularProgress } from "@quimera/thirdparty";
import { Cliente, DirCliente } from "@quimera-extension/base-ventas";
import Quimera, { getSchemas, PropValidation, useStateValue, util } from "quimera";
import React, { useEffect } from "react";
// import { Cliente, DirCliente } from "../../comps";

function FacturasCliNueva({ callbackGuardado, useStyles, ...props }) {
  const [{ factura, savingFactura }, dispatch] = useStateValue();
  const schema = getSchemas().facturaCliNueva;
  // const classes = useStyles()

  useEffect(() => {
    dispatch({
      type: "onInit",
      payload: {
        callbackFacturaChanged: callbackGuardado,
        ...props,
      },
    });
  }, [callbackGuardado]);

  useEffect(() => {
    util.publishEvent(factura.event, callbackGuardado);
  }, [factura.event.serial]);

  console.log("mimensaje_fac", savingFactura);

  return (
    <Quimera.Template id="FacturasCliNueva">
      <QSection
        actionPrefix="nuevaFactura"
        alwaysActive
        dynamicComp={() => (
          <Grid container direction="column" spacing={2}>
            <Grid item xs={12}>
              <Cliente
                id="factura.buffer/codCliente"
                label={`Cliente ${factura.buffer.codCliente ?? ""}`}
                fullWidth
                async
                autoFocus
              />
            </Grid>
            <Grid item xs={12} style={{ visibility: "hidden", height: "0px" }}>
              <DirCliente
                id="factura.buffer/codDir"
                codCliente={factura.buffer.codCliente}
                label="Dirección"
                disabled
                fullWidth
              />
            </Grid>
          </Grid>
        )}
        saveDisabled={() => !schema.isValid(factura.buffer)}
        save={{
          text: !savingFactura ? "Guardar" : <CircularProgress size={20} />,
          icon: !savingFactura ? <Icon>save_alt</Icon> : <></>,
        }}
      ></QSection>
    </Quimera.Template>
  );
}

export default FacturasCliNueva;
