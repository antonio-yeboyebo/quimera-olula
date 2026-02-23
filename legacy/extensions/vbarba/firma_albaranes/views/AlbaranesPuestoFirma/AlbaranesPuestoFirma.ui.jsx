import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  QBoxButton,
} from "@quimera/comps";
import { LinearProgress } from "@quimera/thirdparty";
import Quimera, { useStateValue, useWidth, util } from "quimera";
import React, { useEffect } from "react";

function AlbaranesPuestoFirma({ useStyles }) {
  const [
    {
      cargandoTabla,
      albaranSeleccionado,
      modalAceptarEnviarAlbaran,
      modalVistaEnviarAlbaran,
      modalFirmaVisible,
    },
    dispatch,
  ] = useStateValue();
  // const _c = useStyles()
  // const classes = useStyles()
  const width = useWidth();
  const opcionesDocProp = {
    main: { tipo: "albaranescli", textoBoton: "Enviar valorado" },
    secondary: { tipo: "albaranescli_no_valorado", textoBoton: "Enviar no valorado" },
  };

  useEffect(() => {
    dispatch({ type: "onInit" });
  }, [dispatch]);

  useEffect(() => {
    util.getSetting("appDispatch")({
      type: "setNombrePaginaActual",
      payload: { nombre: "Albaranes Puesto" },
    });

    return () =>
      util.getSetting("appDispatch")({ type: "setNombrePaginaActual", payload: { nombre: "" } });
  }, [dispatch]);

  // const [{ recargarPaginaAlbaranesPuestoFirma }, appDispatch] = useAppValue()

  // useEffect(() => {
  //   if (recargarPaginaAlbaranesPuestoFirma) {
  //     dispatch({ type: 'cargaAlbaranesPuestoFirma', payload: { filtro: filtroAlbaranesPuestoFirma } })
  //     appDispatch({ type: 'setRecargarPaginaAlbaranesPuestoFirma', payload: { value: false } })
  //   }
  // }, [recargarPaginaAlbaranesPuestoFirma])
  // console.log("hola mundo", cargandoTabla);

  return (
    <Quimera.Template id="AlbaranesPuestoFirma">
      {cargandoTabla ? <LinearProgress /> : null}
      <Dialog open={modalAceptarEnviarAlbaran} fullWidth maxWidth="xs" fullScreen={width === "xs"}>
        <DialogTitle id="form-dialog-title">
          <Box display={"flex"} justifyContent={"space-between"}>
            <Box className={"tituloModal"}>Enviar por email</Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="form-dialog-description">
            ¿Desea enviar el albarán firmado por email?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Grid container justifyContent="space-between">
            <Button
              id="concelar"
              text="CANCELAR"
              variant="text"
              color="primary"
              onClick={() => dispatch({ type: "onEnviarEmailRechazado" })}
            />
            <Button
              id="confirmar"
              text="CONFIRMAR"
              variant="text"
              color="secondary"
              onClick={() => dispatch({ type: "onEnviarEmailAceptado" })}
            />
          </Grid>
        </DialogActions>
      </Dialog>
      <Dialog
        open={modalFirmaVisible}
        fullWidth
        maxWidth="md"
        fullScreen={width === "xs" || width === "sm"}
      >
        <Quimera.View
          id="FirmaAlbaranPuesto"
          initAlbaran={albaranSeleccionado}
          callbackCerrado={payload => dispatch({ type: "onCerrarFirmaAlbaran", payload })}
          callbackEnviaEmailProp={payload => dispatch({ type: "onCallbackEnviaEmail", payload })}
          callbackEstadoFirmaModificadoProp={payload =>
            dispatch({ type: "onCallbackEstadoFirmaModificado", payload })
          }
        />
      </Dialog>

      <Dialog
        open={modalVistaEnviarAlbaran}
        fullWidth
        maxWidth="md"
        fullScreen={width === "xs" || width === "sm"}
      >
        <DialogTitle id="form-dialog-title">
          <Box display={"flex"} justifyContent={"center"}>
            <Box className={"tituloModal"}>Envía el albarán por email</Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Quimera.View
            id="EnviarDocumentoEmail"
            opcionesDocProp={opcionesDocProp}
            idDocProp={albaranSeleccionado?.idAlbaran}
            codClienteProp={albaranSeleccionado?.codCliente}
            callbackCerradoProp={payload =>
              dispatch({ type: "onCancelEnviarEmailClicked", payload })
            }
            callbackEnviadoProp={payload => dispatch({ type: "onEmailEnviado", payload })}
          />
        </DialogContent>
      </Dialog>

      <Box display={"flex"} justifyContent={"flex-end"} style={{ padding: "10px 10px 0px 0px" }}>
        <QBoxButton id="recargarPagina" title="Recargar página" icon="refresh" disabled={false} />
      </Box>
      <Box mx={1}>
        <Box id="cajaFiltro" mt={5}>
          <Quimera.SubView id="AlbaranesPuestoFirma/CabeceraFiltro" />
        </Box>
        <Box id="listado">
          <Quimera.SubView id="AlbaranesPuestoFirma/ListadoMobile" />
        </Box>
      </Box>
    </Quimera.Template>
  );
}

export default AlbaranesPuestoFirma;
