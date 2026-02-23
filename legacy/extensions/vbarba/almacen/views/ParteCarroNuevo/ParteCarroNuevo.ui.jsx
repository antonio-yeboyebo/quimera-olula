import { Field, Grid, Icon, QSection, Typography } from "@quimera/comps";
import { CircularProgress } from "@quimera/thirdparty";
import Quimera, { getSchemas, PropValidation, useStateValue, util } from "quimera";
import React, { useEffect } from "react";

import { Agente, Cliente, Proveedor } from "../../comps";
// import { Grid, Button, Column, Field, Table, Dialog, DialogContent, IconButton, Icon, Typography } from '@quimera/comps'

function ParteCarroNuevo({ callbackGuardado, useStyles, ...props }) {
  const [{ buscarPor, buscarPorOptions, nuevoParte, savingParte }, dispatch] = useStateValue();
  const schema = getSchemas().partescarros;
  // const _c = useStyles()

  useEffect(() => {
    dispatch({
      type: "onInit",
      callbackParteChanged: callbackGuardado,
      payload: {
        ...props,
      },
    });
  }, [callbackGuardado]);

  useEffect(() => {
    util.publishEvent(nuevoParte.event, callbackGuardado);
  }, [nuevoParte.event.serial]);

  const handleChange = event => {
    const value = event ? event.target.value?.key : null;
    const option = event ? event.target.value : null;
    const codAgente = util.getUser().codagente ? util.getUser().codagente : null;

    dispatch({
      type: `onBuscarPorChanged`,
      payload: { field: "buscarPor", value, option, codAgente },
    });
  };

  return (
    <Quimera.Template id="ParteCarroNuevo">
      <QSection
        actionPrefix="nuevoParte"
        alwaysActive
        dynamicComp={() => (
          <Grid container direction="column" spacing={2}>
            <Grid item xs={12}>
              <Field.Select
                id="buscarPor"
                label="Buscar por"
                options={buscarPorOptions}
                onChange={handleChange}
                fullWidth
                autoFocus
              // boxStyle={classes.select}
              />
            </Grid>
            {buscarPor === "cliente" && (
              <Grid item xs={12}>
                <Cliente
                  id="nuevoParte.buffer/codCliente"
                  label={`Cliente ${nuevoParte.buffer.codCliente ?? ""}`}
                  fullWidth
                  async
                />
              </Grid>
            )}
            {buscarPor === "proveedor" && (
              <Grid item xs={12}>
                <Proveedor
                  id="nuevoParte.buffer/codProveedor"
                  label={`Proveedor ${nuevoParte.buffer.codProveedor ?? ""}`}
                  fullWidth
                  async
                />
              </Grid>
            )}
            {buscarPor === "transportista" && (
              <Grid item xs={12}>
                <Proveedor
                  id="nuevoParte.buffer/codTransportista"
                  transportista={buscarPor === "transportista"}
                  label={`Transportista ${nuevoParte.buffer.codTransportista ?? ""}`}
                  fullWidth
                  async
                />
              </Grid>
            )}
            {buscarPor && (
              <>
                <Grid item xs={12}>
                  <Agente
                    id="nuevoParte.buffer/codAgente"
                    label={`Agente ${nuevoParte.buffer.codAgente ?? ""}`}
                    fullWidth
                    // value={util.getUser().codagente}
                    async
                  />
                </Grid>

                <Grid item xs={6}>
                  <Field.Date id="nuevoParte.buffer/fecha" label="Fecha" fullWidth />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="overline">Observaciones</Typography>
                  <Field.TextArea id="nuevoParte.buffer.observaciones" label="" fullWidth />
                </Grid>
              </>
            )}
          </Grid>
        )}
        save={{
          text: !savingParte ? "Crear parte" : <CircularProgress size={20} />,
          icon: !savingParte ? <Icon>save_alt</Icon> : <></>,
        }}
        cancel={{
          display: "none",
        }}
        saveDisabled={() => !schema.isValid(nuevoParte.buffer)}
      ></QSection>
    </Quimera.Template>
  );
}

export default ParteCarroNuevo;
