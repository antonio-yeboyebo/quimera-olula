import { Box, Button, Field, Grid, Icon, IconButton, QTitleBox, Typography } from "@quimera/comps";
import { Backdrop, CircularProgress, ListItemText, SignaturePad } from "@quimera/thirdparty";
import Quimera, { useStateValue } from "quimera";
import { useEffect, useState } from "react";
// import { Contacto } from "../../comps";

function FirmaAlbaranPuesto({
  initAlbaran,
  callbackCerrado,
  callbackEnviaEmailProp,
  callbackEstadoFirmaModificadoProp,
  codContacto,
  sigpad,
  useStyles,
}) {
  const [{ albaran, firmaAlbaran, indicarFirmando, lineas }, dispatch] = useStateValue();
  // const _c = useStyles()
  const classes = useStyles();
  const [puedeFirmar, setPuedeFirmar] = useState(false);

  useEffect(() => {
    // console.log("onInitStockChanged useffecting", initStock);
    dispatch({
      type: "onInitAlbaran",
      payload: {
        initAlbaran,
      },
    });
  }, [initAlbaran]);

  useEffect(() => {
    dispatch({
      type: "onGuardaCallback",
      payload: {
        callbackCerrado,
        callbackEnviaEmailProp,
        callbackEstadoFirmaModificadoProp
      },
    });
  }, [dispatch]);

  const puedoFirmar = () => sigPad.isEmpty && !sigPad.isEmpty();
  // !!firmaAlbaran.firmadopor && !!firmaAlbaran.cifnif && sigPad.isEmpty && !sigPad.isEmpty();

  let sigPad = {};
  useEffect(() => {
    setPuedeFirmar(puedoFirmar());
  }, [firmaAlbaran]);

  const limpiar = () => {
    sigPad.clear();
    setPuedeFirmar(puedoFirmar());
  };
  const handleEnd = () => {
    setPuedeFirmar(puedoFirmar());
  };
  const firmar = () => {
    dispatch({ type: "onFirmarClicked", payload: { firma: sigPad.toDataURL("image/png") } });
  };

  return (
    <Quimera.Template id="FirmaAlbaranPuesto">
      {albaran !== null && (
        <>
          <Box
            width="100%"
            display="flex"
            alignItems="flex-end"
            className={classes.cabeceraFirmaTitulo}
          >
            <Box>
              <IconButton id="cerrar" size="small" onClick={() => callbackCerrado()}>
                <Icon>close</Icon>
              </IconButton>
            </Box>
            <Box
              flexGrow={1}
              display="flex"
              justifyContent="center"
            >{`Firma albarán  ${albaran.buffer.codigo}`}</Box>
          </Box>
          <Box m={2}>
            <Grid container direction="row" spacing={1}>
              {/* <Grid item xs={12} sm={12}>
                <Contacto
                  id="firmaAlbaran.codContacto"
                  codcliente={albaran.buffer.codCliente}
                  fullWidth
                  label="Seleccione contacto"
                  pl={4}
                />
              </Grid> */}
              <Grid item xs={8} sm={8}>
                <Typography variant="body1">{`Firmado por:  ${initAlbaran.firmadoPor}`}</Typography>
              </Grid>
              {/* <Grid item xs={4} sm={4}>
                <Field.Text id="firmaAlbaran.cifnif" label="DNI" />
              </Grid>
              <Grid item xs={6} sm={6}>
                <Field.Date id="firmaAlbaran.fecha" label="Fecha" />
              </Grid>
              <Grid item xs={6} sm={6}>
                <Field.Time id="firmaAlbaran.hora" label="Hora" />
              </Grid> */}
              <Grid item xs={12} sm={12}>
                <Field.TextArea
                  id="firmaAlbaran.observacionesfirma"
                  label="Observaciones"
                  fullWidth
                />
              </Grid>

              {lineas.idList.length > 0 && (
                <Grid item xs={12}>
                  <QTitleBox titulo="Lineas de albarán">
                    {Object.values(lineas.dict).map(l => (
                      <ListItemText
                        disableTypography
                        primary={
                          <Box width={1}>
                            <Typography variant="body1">{`${l.cantidad} X ${l.descripcion}`}</Typography>
                          </Box>
                        }
                      />
                    ))}
                  </QTitleBox>
                </Grid>
              )}
              <Grid item xs={12} sm={12}>
                <SignaturePad
                  id="sigpad"
                  onEnd={handleEnd}
                  canvasProps={{ className: classes.sigPad }}
                  ref={ref => {
                    sigPad = ref;
                  }}
                />
              </Grid>
              <Box id="botonesFirma" width={1} display="flex">
                <Box flexGrow={1}>
                  <Button
                    id="limpiarFirma"
                    text="Limpiar"
                    variant="text"
                    className={classes.botonPrimarioText}
                    onClick={limpiar}
                  />
                </Box>
                <Box pr={2}>
                  <Button
                    id="firmar"
                    text="Firmar"
                    variant="text"
                    className={classes.botonPrimarioText}
                    onClick={firmar}
                    disabled={!puedeFirmar}
                  />
                </Box>
              </Box>
            </Grid>
          </Box>
          <Backdrop className={classes.backdrop} open={indicarFirmando}>
            <Box align="center">
              Firmando albarán&nbsp;&nbsp;
              <br />
              <CircularProgress />
            </Box>
          </Backdrop>
        </>
      )}
    </Quimera.Template>
  );
}

export default FirmaAlbaranPuesto;
