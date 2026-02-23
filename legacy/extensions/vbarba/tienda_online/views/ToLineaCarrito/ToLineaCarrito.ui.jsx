import { Grid, QTitleBox, Typography } from "@quimera/comps";
import Quimera, { getSchemas, PropValidation, useStateValue, util } from "quimera";
import { useEffect } from "react";

import { Totales } from "@quimera-extension/base-area_clientes";
// import { Totales } from "../../comps";

function ToLineaCarrito({ callbackGuardada, disabled, lineaInicial, useStyles }) {
  const [{ linea, sections }, dispatch] = useStateValue();
  const classes = useStyles();
  const schema = getSchemas().lineaCarrito;
  const { buffer } = linea;

  // useEffect(() => {
  //   util.publishEvent(linea.event, callbackGuardada);
  // }, [linea.event.serial]);

  // useEffect(() => {
  //   dispatch({
  //     type: "onInitLinea",
  //     payload: {
  //       initLinea: lineaInicial,
  //     },
  //   });
  // }, [lineaInicial]);

  // console.log("_____________");
  // console.log(linea);

  return (
    <Quimera.Template id="ToLineaCarrito">
      <Grid container spacing={0} direction="column">
        <Grid item xs={12}>
          <QTitleBox titulo={`REF ${linea.buffer.referencia ?? ""}`}>
            <Typography variant="h6">{linea.buffer.descripcion}</Typography>
          </QTitleBox>
        </Grid>
      </Grid>
    </Quimera.Template >
  );
}

export default ToLineaCarrito;
