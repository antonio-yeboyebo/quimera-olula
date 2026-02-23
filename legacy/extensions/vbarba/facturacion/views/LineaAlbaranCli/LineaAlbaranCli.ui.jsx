import {
  Box,
  Button,
  Collapse,
  Field,
  Grid,
  Icon,
  LinearProgress,
  QSection,
  Typography,
} from "@quimera/comps";
import { Totales } from "@quimera-extension/base-area_clientes";
import Quimera, { getSchemas, PropValidation, useStateValue, util } from "quimera";
import { useEffect } from "react";

import { ProveedorArticulo, QArticuloVbarba } from "../../comps";

function LineaAlbaranCli({ callbackGuardada, disabled, lineaInicial, useStyles }) {
  const [{ linea, sections }, dispatch] = useStateValue();
  const classes = useStyles();
  const schema = getSchemas().lineasAlbaranesCli;
  const { buffer } = linea;

  useEffect(() => {
    util.publishEvent(linea.event, callbackGuardada);
  }, [linea.event.serial]);

  useEffect(() => {
    dispatch({
      type: "onInitLinea",
      payload: {
        initLinea: lineaInicial,
      },
    });
  }, [lineaInicial]);

  return (
    <Quimera.Template id="LineaAlbaranCli">
      {linea.buffer._status === "deleting" && (
        <Box width={1}>
          <Typography variant="body2">Borrando línea...</Typography>
          <LinearProgress />
        </Box>
      )}
      <Collapse in={linea.buffer._status !== "deleting"}>
        <Grid container spacing={0} direction="column">
          <Grid item xs={12}>
            <Box display="flex" justifyContent="right" mt={1}>
              {!disabled && (
                <Button
                  id="deleteLinea"
                  text="Borrar"
                  variant="outlined"
                  color="primary"
                  startIcon={<Icon>delete</Icon>}
                  onClick={() =>
                    dispatch({ type: "onDeleteLineaClicked", payload: { item: linea.buffer } })
                  }
                />
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <QSection
              title={buffer.referencia}
              actionPrefix="linea/articulo"
              alwaysInactive={disabled}
              dynamicComp={() => (
                <Grid container spacing={1} direction="column" >
                  <Grid item xs={12}>
                    <QArticuloVbarba
                      id="linea.buffer/referencia"
                      label="Artículo"
                      boxStyle={classes.referencia}
                      seVende
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field.Schema id="linea.buffer.descripcion" schema={schema} fullWidth />
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
                </Grid>
              )}
              saveDisabled={() => !schema.isValid(buffer)}
            >
              <Typography variant="h6">{buffer.descripcion}</Typography>
            </QSection>
          </Grid>

          <Grid item xs={12}>
            <QSection
              actionPrefix="linea/cantidad"
              alwaysInactive={disabled}
              dynamicComp={() => (
                <Grid container spacing={1} direction="column" >
                  <Grid item xs={6}>
                    <Field.Schema id="linea.buffer/cantidad" schema={schema} fullWidth autoFocus />
                  </Grid>
                  <Grid item xs={6}>
                    <Field.Schema id="linea.buffer/pvpUnitario" schema={schema} fullWidth />
                  </Grid>
                </Grid>
              )}
              saveDisabled={() => !schema.isValid(buffer)}
            >
              <Typography variant="h6" align="right">{`${util.formatter(
                buffer.cantidad,
                2,
              )} x ${util.euros(buffer.pvpUnitario)}`}</Typography>
            </QSection>
          </Grid>

          <Grid item xs={12}>
            <QSection actionPrefix="totales" alwaysInactive>
              <Totales
                totales={[
                  { name: "SubTotal", value: buffer.pvpSinDto },
                  { name: "Total Dto.", value: buffer.pvpSinDto - buffer.pvpTotal },
                  { name: "Total", value: buffer.pvpTotal },
                ]}
              />
            </QSection>
          </Grid>

          <Grid item xs={6}>
            <QSection
              title="Descuentos"
              actionPrefix="linea/descuentos"
              mr={1}
              alwaysInactive={disabled}
              dynamicComp={() => (
                <Grid container spacing={1} direction="column" >
                  <Grid item xs={6}>
                    <Field.Schema id="linea.buffer/dtoLineal" schema={schema} fullWidth />
                  </Grid>
                  <Grid item xs={6}>
                    <Field.Schema id="linea.buffer/dtoPor" schema={schema} fullWidth />
                  </Grid>
                </Grid>
              )}
              saveDisabled={() => !schema.isValid(buffer)}
            >
              {!!buffer.dtoLineal && (
                <Typography variant="subtitle1">Lineal {util.euros(buffer.dtoLineal)}</Typography>
              )}
              {!!buffer.dtoPor && (
                <Typography variant="subtitle1">Porcentual {buffer.dtoPor}%</Typography>
              )}
              {!buffer.dtoLineal && !buffer.dtoPor && (
                <Typography variant="subtitle1">Sin descuentos</Typography>
              )}
            </QSection>
          </Grid>

          <Grid item xs={6}>
            <QSection
              title="Impuestos"
              actionPrefix="linea/Impuestos"
              alwaysInactive={true}
              dynamicComp={() => (
                <Grid container spacing={1} direction="column" >
                  <Grid item xs={6}>
                    <Field.Schema id="linea.buffer/codImpuesto" schema={schema} fullWidth />
                  </Grid>
                  <Grid item xs={6}>
                    <Field.Schema id="linea.buffer/iva" schema={schema} fullWidth />
                  </Grid>
                  <Grid item xs={6}>
                    <Field.Schema id="linea.buffer/recargo" schema={schema} fullWidth />
                  </Grid>
                  <Grid item xs={6}>
                    <Field.Schema id="linea.buffer/irpf" schema={schema} fullWidth />
                  </Grid>
                </Grid>
              )}
              saveDisabled={() => !schema.isValid(buffer)}
            >
              {!!buffer.iva && (
                <Typography variant="subtitle1">
                  IVA {buffer.codImpuesto} {buffer.iva}%
                </Typography>
              )}
              {!!buffer.recargo && (
                <Typography variant="subtitle1">
                  Recargo de Equivalencia {buffer.recargo}%
                </Typography>
              )}
              {!!buffer.irpf && <Typography variant="subtitle1">IRPF {buffer.irpf}%</Typography>}
            </QSection>
          </Grid>
        </Grid>
      </Collapse>
    </Quimera.Template>
  );
}

export default LineaAlbaranCli;
