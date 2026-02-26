import { Box, Collapse, Field, Grid, Icon, IconButton, QSection, Typography } from "@quimera/comps";
import Quimera, { getSchemas, PropValidation, useStateValue, util } from "quimera";
import React, { useEffect } from "react";

// import { QArticulo } from "@quimera-extension/base-almacen";
import {
  FieldConNavegacionEnter,
  ProveedorArticulo,
  QArticuloVbarbaMarcado,
  useArticuloFocus,
} from "../../comps";

function LineaPresupuestoCliNueva({ callbackGuardada, idPresupuesto, useStyles }) {
  const [{ inline, linea }, dispatch] = useStateValue();
  const classes = useStyles();
  const schema = getSchemas().lineasPresupuestosCli;

  useEffect(() => {
    // console.log("INIT NUEVA", idPresupuesto, dispatch, callbackGuardada);
    dispatch({
      type: "onInit",
      payload: {
        idParentLinea: idPresupuesto,
      },
    });
  }, [idPresupuesto]);

  useEffect(() => {
    util.publishEvent(linea.event, callbackGuardada);
  }, [linea.event.serial]);

  // Devolver foco después de guardar línea
  const articuloKey = useArticuloFocus(linea, inline, dispatch);

  return (
    <Quimera.Template id="LineaPresupuestoCliNueva">
      {inline && (
        <Box>
          <Box width={1} display="flex" alignItems="flex-end">
            <QArticuloVbarbaMarcado
              key={articuloKey} // Key dinámico para forzar re-render
              id="linea.buffer/referencia"
              label="Artículo"
              boxStyle={classes.referencia}
              seVende
              fullWidth
              autoFocus
            />
            <FieldConNavegacionEnter>
              <Field.Schema
                id="linea.buffer/cantidad"
                schema={schema}
                boxStyle={classes.cantidad}
              />
            </FieldConNavegacionEnter>
            <Box>
              <IconButton id="saveLinea" size="small" disabled={!schema.isValid(linea.buffer)}>
                <Icon fontSize="large">save_alt</Icon>
              </IconButton>
            </Box>
            <IconButton id="expandir" size="small">
              <Icon color="secondary" fontSize="large">
                expand
              </Icon>
            </IconButton>
          </Box>
          <Quimera.Block id="afterDescripcion" />
        </Box>
      )}
      <Collapse in={!inline} mountOnEnter>
        <QSection
          title={`Nueva línea ${linea.descripcion ?? ""}`}
          actionPrefix="lineaExpandida"
          alwaysActive
          dynamicComp={() => (
            <Grid container spacing={1} direction="column" >
              <Grid item xs={9}>
                <QArticuloVbarbaMarcado
                  id="linea.buffer/referencia"
                  label="Artículo"
                  boxStyle={classes.referencia}
                  seVende
                  fullWidth
                />
              </Grid>
              <Grid item xs={3}>
                <FieldConNavegacionEnter>
                  <Field.Schema
                    id="linea.buffer/cantidad"
                    schema={schema}
                    fullWidth
                    style={{ backgroundColor: "#f5d6a0" }}
                  />
                </FieldConNavegacionEnter>
              </Grid>

              <Grid item xs={12}>
                <Field.Schema id="linea.buffer/descripcion" schema={schema} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <Quimera.Block id="afterDescripcion" />
              </Grid>
              <Grid item xs={12}>
                <ProveedorArticulo
                  id="linea.buffer/codProveedor"
                  label={`Proveedor`}
                  referencia={linea.buffer.referencia}
                  fullWidth
                  async
                />
              </Grid>
              <Grid item xs={6}>
                <Field.Schema
                  id="linea.buffer/codImpuesto"
                  schema={schema}
                  fullWidth
                  style={{ display: "none" }}
                />
              </Grid>
              <Grid item xs={6}>
                <Field.Schema
                  id="linea.buffer/iva"
                  schema={schema}
                  fullWidth
                  style={{ display: "none" }}
                />
              </Grid>
              <Grid item xs={6}>
                <Field.Schema
                  id="linea.buffer/recargo"
                  schema={schema}
                  fullWidth
                  style={{ display: "none" }}
                />
              </Grid>
              <Grid item xs={6}>
                <Field.Schema
                  id="linea.buffer/irpf"
                  schema={schema}
                  fullWidth
                  style={{ display: "none" }}
                />
              </Grid>
              <Grid item xs={6}>
                <Field.Schema
                  id="linea.buffer/pvpUnitario"
                  label="PVP*"
                  schema={schema}
                  fullWidth
                  style={{ backgroundColor: "#f5d6a0" }}
                />
              </Grid>
              <Grid item xs={6}>
                <Field.Schema
                  id="linea.buffer/pvpSinDto"
                  label="importe*"
                  schema={schema}
                  fullWidth
                  style={{ backgroundColor: "#f5d6a0" }}
                />
              </Grid>
              <Grid item xs={6}>
                <Field.Schema
                  id="linea.buffer/dtoPor"
                  label="%Dto"
                  schema={schema}
                  fullWidth
                  style={{ backgroundColor: "#f5d6a0" }}
                />
              </Grid>
              <Grid item xs={6}>
                <Field.Schema
                  id="linea.buffer/dtoLineal"
                  schema={schema}
                  fullWidth
                  style={{ display: "none" }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box width={1} display="flex" flexDirection="column" alignItems="flex-end">
                  <Typography variant="overline">Total</Typography>
                  <Typography variant="h5">{util.euros(linea.buffer.pvpTotal)}</Typography>
                </Box>
              </Grid>
            </Grid>
          )}
          saveDisabled={() => !schema.isValid(linea.buffer)}
        ></QSection>
      </Collapse>
    </Quimera.Template>
  );
}

export default LineaPresupuestoCliNueva;
