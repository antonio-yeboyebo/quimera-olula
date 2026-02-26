import { Field, Grid, QSection } from "@quimera/comps";
import Quimera, { getSchemas, PropValidation, useStateValue, util } from "quimera";
import React, { useEffect } from "react";

function ToCarritoNuevo({ callbackGuardado, useStyles, ...props }) {
  const [{ carrito }, dispatch] = useStateValue();
  const schema = getSchemas().nuevoCarrito;
  // const classes = useStyles()

  useEffect(() => {
    dispatch({
      type: "onInit",
      payload: {
        callbackCarritoChanged: callbackGuardado,
        ...props,
      },
    });
  }, [callbackGuardado]);

  useEffect(() => {
    util.publishEvent(carrito.event, callbackGuardado);
  }, [carrito.event.serial]);

  console.log(carrito);

  return (
    <Quimera.Template id="ToCarritoNuevo">
      <QSection
        title="Nuevo Carrito"
        actionPrefix="nuevoCarrito"
        alwaysActive
        dynamicComp={() => (
          <Grid container direction="column" spacing={2}>
            <Grid item xs={12}>
              <Field.Schema id="carrito.buffer/referencia" schema={schema} fullWidth />
            </Grid>
          </Grid>
        )}
        saveDisabled={() => !schema.isValid(carrito.buffer)}
        save={{
          text: "Crear Carrito",
        }}
      ></QSection>
    </Quimera.Template>
  );
}

export default ToCarritoNuevo;
