import { Button, Grid, ListInfiniteScroll, Typography } from "@quimera/comps";
import { Avatar, Box, List, ListItem, ListItemAvatar, ListItemText } from "@quimera/thirdparty";
import Quimera, { PropValidation, useStateValue, useWidth, util } from "quimera";
import React from "react";

function ListadoMobile({ useStyles }) {
  const [{ albaranes }, dispatch] = useStateValue();
  const classes = useStyles();
  const albaranesList = Object.values(albaranes?.dict ?? {}).sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha),
  ); // Ordenar por fecha descendente
  const width = useWidth();
  const mobile = ["xs", "sm"].includes(width);

  // console.log("mimensaje_albaranes", albaranes);

  return (
    <Quimera.Template id="ListadoMobile">
      <List id="albaranesList">
        <ListInfiniteScroll
          data={albaranesList}
          next={() => dispatch({ type: "onNextAlbaranes" })}
          hasMore={albaranes?.page?.next !== null}
          scrollableTarget=""
        >
          {albaranesList.map(albaran => (
            <ListItem key={albaran.idAlbaran} divider={true}>
              <ListItemAvatar>
                <Avatar>{albaran.nombreCliente.substring(0, 1).toUpperCase()}</Avatar>
              </ListItemAvatar>
              <ListItemText
                disableTypography
                primary={
                  <Grid xs={12} sm container item>
                    <Grid item xs={8}>
                      <Typography component="div" variant="body1">
                        <strong>{`${albaran.codigo}`}</strong>
                        {` ${util.formatDate(albaran.fecha)}`}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={4}
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      {!albaran.firmado ? (
                        <Button
                          id="firmarAlbaran"
                          data={{ albaran }}
                          color="secondary"
                          variant="contained"
                          text={!albaran.firmado ? "Firmar" : "Firmado"}
                          disabled={albaran.firmado}
                          className={classes.botonPrimario}
                        />
                      ) : (
                        <Box display={"flex"} flexDirection={"column"} justifyContent={"flex-end"}>
                          {mobile && (
                            <Typography
                              component="span"
                              variant="body2"
                              align="right"
                            >{`Firmado por: `}</Typography>
                          )}
                          <Typography component="span" variant="body2" align="right">
                            {`${mobile ? "" : "Firmado por: "}`}
                            <strong>{`${albaran.firmadoPor}`}</strong>
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                }
                secondary={
                  <Grid item xs={12} sm container>
                    <Grid item xs={8} sm container>
                      <Grid item xs={12}>
                        <Typography
                          component="span"
                          variant="body2"
                        >{`${albaran.nombreCliente}`}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography
                          component="span"
                          variant="body2"
                        >{`${albaran.direccion}`}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography component="span" variant="body2">
                          {albaran.codpostal ? `${albaran.codpostal}` : " "} {` ${albaran.ciudad}`}{" "}
                          {` ${albaran.provincia}`}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      xs={4}
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "flex-end",
                      }}
                    >
                      <Box>
                        <Button
                          id="irESCarros"
                          data={{ albaran }}
                          color="secondary"
                          className={classes.botonSecundario}
                          variant="contained"
                          text={"E/S carros"}
                          onClick={() =>
                            dispatch({
                              type: albaran.codigoParte
                                ? "onIrESCarrosClicked"
                                : "onCrearESCarrosClicked",
                              payload: {
                                ...albaran,
                              },
                            })
                          }
                        />
                      </Box>
                    </Grid>
                  </Grid>
                }
              ></ListItemText>
            </ListItem>
          ))}
        </ListInfiniteScroll>
      </List>
    </Quimera.Template>
  );
}

export default ListadoMobile;
