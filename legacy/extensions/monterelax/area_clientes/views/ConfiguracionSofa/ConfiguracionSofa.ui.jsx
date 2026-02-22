import { Box, Button, Grid, Icon, Typography } from "@quimera/comps";
import { Dialog, DialogActions, DialogContent, DialogTitle, DragDropContext, useTranslation } from "@quimera/thirdparty";
import Quimera, { getSchemas, useStateValue, useWidth, util } from "quimera";
import { useEffect } from "react";

import { QTela } from "../../comps";

function ConfiguracionSofa({ idModeloProp, callbackVolver, useStyles }) {
  const [
    { comprando, configuraciones, sofa, idModelo, idTela, misConfiguraciones, totalPrecio },
    dispatch,
  ] = useStateValue();
  const schema = getSchemas().configSofa;
  // const _c = useStyles()
  const classes = useStyles();
  const { t } = useTranslation();
  useEffect(() => {
    dispatch({
      type: "init",
      payload: { callbackVolver, idModeloProp },
    });
  }, [dispatch, callbackVolver, idModeloProp]);

  // useEffect(() => {
  //   dispatch({
  //     type: "onCargaModelo",
  //     payload: {
  //       idModelo,
  //     },
  //   });
  // }, [idModelo]);

  // [["codfamilia","eq","TELA"]]}

  const width = useWidth();
  const mobile = ["xs", "sm"].includes(width);
  const tablet = ["md"].includes(width);

  const baseImageSrc = util.getEnvironment().getUrlImages();
  const srcImage = `${baseImageSrc}/modelos/${idModeloProp.toUpperCase()}.jpg`;
  const noImage = `${baseImageSrc}/noimage.png`;
  const altura = `calc(100vh - ${360}px)`;
  const alturaDropArea = `calc(100vh - ${740}px)`;

  return (
    sofa && (
      <Quimera.Template id="ConfiguracionSofa">
        <Dialog open={idModelo} classes={{ paper: classes.paper8080 }}>
          <DialogTitle id="form-dialog-title">
            <Typography align="center">
              Modelo {idModelo}
            </Typography>
          </DialogTitle>
          <DialogContent >
            <DragDropContext
              onDragEnd={result =>
                dispatch({
                  type: "onConfiguracionDropped",
                  // payload: { result, estadosActual, bibliotecaEstados },
                  payload: { result, misConfiguraciones },
                })
              }
              onDragStart={result => dispatch({ type: "handleDragStart", payload: { result } })}
            >
              <Grid container justifyContent="center" direction="row" >
                <Grid container item xs={1} justifyContent="center" direction="column" style={{ width: '75%' }}>
                  <Grid
                    container
                    item
                    // xs={12}
                    justifyContent="center"
                  // style={{ height: "300px" }}

                  >
                    <Grid container item xs={6} justifyContent="center" alignItems="flex-start">
                      <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
                        <img
                          src={srcImage}
                          onError={({ currentTarget }) => {
                            currentTarget.onerror = null; // prevents looping
                            currentTarget.src = noImage;
                          }}
                          // height={"400px"}
                          height="300px"
                          // width="100%"
                          alt={`Modelo ${idModelo}`}
                          loading="lazy"
                        />
                        <Typography variant="caption" align="right">
                          Imagen ejemplo del modelo
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item container xs={6} justifyContent="center">
                      <Box mx={2} width={1}>
                        <QTela
                          id="idTela"
                          label="Tela"
                          codFamilia="TELA"
                          idModelo={idModelo}
                          fullWidth
                          autoFocus
                          noOptionsText="Buscar tela por nombre"
                        />
                        <Box mt={2} width={1}>
                          <Typography variant="h5">Configuración seleccionada:</Typography>
                          <Box mt={1}>
                            {misConfiguraciones.map(conf => (
                              <Box>
                                <Typography variant="subtitle2">{`${conf.confbase} ${conf.descripcion
                                  } (${util.euros(conf.precio)})`}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container item>
                    <Box className={classes.cajaDropArea} minHeight={alturaDropArea} width={1}>
                      <Quimera.SubView id="ConfiguracionSofa/Montador" />
                    </Box>
                  </Grid>
                </Grid>
                <Grid
                  container
                  item
                  xs={6}
                  justifyContent="center"
                  style={{ borderLeft: "1px solid lightgrey", width: '25%' }}
                >
                  {!idTela ? (
                    <Typography variant="h4" align="center">
                      Escoja una tela para cargar las posibles configuraciones
                    </Typography>
                  ) : (
                    <Grid container item style={{ overflow: "scroll", maxHeight: `${altura}` }}>
                      <Quimera.SubView id="ConfiguracionSofa/Configuraciones" />
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </DragDropContext>
          </DialogContent>
          <DialogActions>
            {!mobile ? (
              <Grid container justifyContent="space-between">
                <Grid xs={4} item container alignItems="center">
                  <Button
                    id="cancelar"
                    text="Volver al catálogo"
                    variant="text"
                    color="secondary"
                    onClick={() => dispatch({ type: "volverCatalogo" })}
                  />
                </Grid>
                <Grid xs={5} item container justifyContent="flex-end">
                  <Box mr={2}>
                    <Typography variant="h3">{util.euros(totalPrecio)}</Typography>
                  </Box>
                  <Button
                    id="saveSofa"
                    variant="text"
                    color="primary"
                    startIcon={<Icon>shopping_cart</Icon>}
                    // disabled={!schema.isValid(sofa?.buffer)}
                    disabled={
                      !idTela ||
                      misConfiguraciones.filter(c => c?.confbase).length === 0 ||
                      comprando
                    }
                    text={t("itemCatalogo.comprar")}
                  />
                </Grid>
              </Grid>
            ) : (
              <Grid container justifyContent="space-between" flexDirection="column">
                <Grid item container alignItems="center" justifyContent="flex-end">
                  <Box mr={2}>
                    <Typography variant="h3">{util.euros(150)}</Typography>
                  </Box>
                </Grid>
                <Grid item container justifyContent="space-between">
                  <Button
                    id="cancelar"
                    text="Volver al catálogo"
                    variant="text"
                    color="secondary"
                    onClick={() => dispatch({ type: "volverCatalogo" })}
                  />
                  <Button
                    id="saveSofa"
                    variant="text"
                    color="primary"
                    startIcon={<Icon>shopping_cart</Icon>}
                    // disabled={!schema.isValid(sofa?.buffer)}
                    disabled={
                      !idTela ||
                      misConfiguraciones.filter(c => c?.confbase).length === 0 ||
                      comprando
                    }
                    text={t("itemCatalogo.comprar")}
                  />
                </Grid>
              </Grid>
            )}
          </DialogActions>
        </Dialog>
      </Quimera.Template >
    )
  );
}

export default ConfiguracionSofa;
