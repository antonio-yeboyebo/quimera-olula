import {
  Box,
  Button,
  Column,
  Container,
  Field,
  Grid,
  Icon,
  IconButton,
  Table,
  Typography,
} from "@quimera/comps";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@quimera/thirdparty";
import Quimera, { useStateValue, util } from "quimera";
import { useEffect } from "react";

import { QAlmacenesVbarba } from "../../comps";

function Stock({ idStock, initStock, referencia, callbackChanged, callbackVolver, useStyles }) {
  const [{ modalAddAlmacen, almacenes, miFinca, totalStockFinca, stock }, dispatch] =
    useStateValue();
  const classes = useStyles();
  useEffect(() => {
    !!initStock &&
      dispatch({
        type: "onInitStock",
        payload: {
          callbackChanged,
          initStock,
        },
      });
    !initStock &&
      !!referencia &&
      dispatch({
        type: "onInitStockByIdPrevio",
        payload: {
          callbackChanged,
          filterStock: ["referencia", "eq", referencia],
        },
      });
  }, [initStock, referencia]);

  useEffect(() => {
    util.publishEvent(stock.event, callbackChanged);
    stock?.event?.event === "cancelled" && callbackVolver({ data: stock.data });
  }, [stock.event.serial]);

  const handleKeyDown = event => {
    const value = event.target.value;
    const accion = event.target.name;
    const noEsNumeroSumar = accion === "sumarCantidad" && isNaN(value);
    if (event.keyCode === 13 && value.length > 0 && !noEsNumeroSumar) {
      const codalmacen = event.target.id.split(accion)[1];
      const almacen = almacenes[codalmacen];
      dispatch({ type: accion, payload: { value, almacen } });
    }
  };

  const handleBlurSumar = event => {
    const value = event.target.value;
    const accion = event.target.name;
    const noEsNumeroSumar = accion === "sumarCantidad" && isNaN(value);
    if (value.length > 0 && !noEsNumeroSumar) {
      const codalmacen = event.target.id.split(accion)[1];
      const almacen = almacenes[codalmacen];
      dispatch({ type: accion, payload: { value, almacen } });
    }
  };

  const handleKeyDownCantidad = event => {
    const value = event.target.value;
    const accion = event.target.name;
    const noEsNumeroSumar = accion === "cambiarCantidadStock" && isNaN(value);
    if (event.keyCode === 13 && value.length > 0 && !noEsNumeroSumar) {
      const codalmacen = event.target.id.split(accion)[1];
      const almacen = almacenes[codalmacen];
      dispatch({ type: accion, payload: { value, almacen } });
    }
  };

  const handleBlurCantidad = event => {
    const value = event.target.value;
    const accion = event.target.name;
    const noEsNumeroSumar = accion === "cambiarCantidadStock" && isNaN(value);
    if (value.length > 0 && !noEsNumeroSumar) {
      const codalmacen = event.target.id.split(accion)[1];
      const almacen = almacenes[codalmacen];
      dispatch({ type: accion, payload: { value, almacen } });
    }
  };

  return (
    <Quimera.Template id="Stock">
      <Container>
        <Box mt={1}>
          <Grid container direction="column" style={{ marginBottom: "10px" }}>
            <Grid item container xs={12} md={2} pb={1} justifyContent="flex-start">
              <Typography variant="subtittle1">{`Finca: ${miFinca.descripcion}`}</Typography>
            </Grid>
            <Grid item container xs={12} md={8} pb={1} justifyContent="center">
              <Typography component="span" variant="h6">{`${stock?.buffer?.referencia ?? ""} / ${stock?.buffer?.descripcion ?? ""
                } / ${stock?.buffer?.precioRef ?? "0"} €`}</Typography>
            </Grid>
            <Grid xs={0} md={2} />
          </Grid>
          <Grid container align="center" justifyContent="space-between">
            <Grid item container xs={6} justifyContent="flex-start" style={{ gap: 8 }}>
              <Grid item xs={3}>
                <Button
                  id="cambiarDisponible"
                  text={`${stock.buffer.disponible ? "Disponible" : "No disponible"}`}
                  color={stock.buffer.disponible ? "secondary" : "primary"}
                  variant="contained"
                  fullWidth
                  startIcon={<Icon>swap_horiz</Icon>}
                />
              </Grid>
              <Grid item>
                <Button
                  id="editarArticulo"
                  text="Editar"
                  color="secondary"
                  variant="contained"
                  startIcon={<Icon>edit</Icon>}
                />
              </Grid>
            </Grid>
            <Grid item container xs={6} justifyContent="flex-end" style={{ gap: 8 }}>
              <Grid item>
                <Button
                  id="verImagen"
                  text="Ver imagen"
                  color="secondary"
                  variant="contained"
                  disabled={!stock.buffer.tieneFoto}
                  startIcon={<Icon>image</Icon>}
                />
              </Grid>
              <Grid item>
                <Button
                  id="cambiarImagen"
                  onClick={() => document.getElementById("hiddenAttachInputImage").click()}
                  text={`${stock.buffer.tieneFoto ? "Cambiar" : "Añadir"} imagen`}
                  color="secondary"
                  variant="contained"
                  startIcon={<Icon>add_photo_alternate</Icon>}
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
        <Box>
          <Grid container driection="row" className={classes.cajaStock}>
            <Grid item container xs={12} pb={1} justifyContent="space-between">
              <Typography variant="subtittle1">{`Total Stock: ${totalStockFinca}`}</Typography>
            </Grid>
            <Grid container driection="row" justifyContent="flex-end">
              <Box mt={1}>
                <IconButton id="addAlmacen" size="medium" tooltip="Añadir almacén">
                  <Icon fontSize="medium">add_circle_outline_outlined</Icon>
                </IconButton>
              </Box>
            </Grid>
          </Grid>
          <Box id="scrollableTablaStock" p={0}>
            <Table
              id="tdbStock"
              idField="almacen"
              data={Object.values(almacenes)}
              clickMode="line"
              loader={null}
              scrollableTarget="scrollableTablaStock"
            >
              <Column.Text
                id="almacen"
                header="Almacén"
                pl={2}
                value={almacen => almacen.nombre}
                flexGrow={1}
              />
              {/* <Column.Action
                id="cantidadStock"
                header="Cantidad"
                value={almacen => (
                  <Field.Int
                    name="cantidad"
                    id={`cantidad${almacen.codalmacen}`}
                    value={almacen.cantidad}
                  />
                )}
                flexGrow={1}
              disabled
              /> */}
              <Column.Action
                id="cantidadStock"
                header="Cantidad"
                value={almacen => (
                  <Field.Int
                    name="cambiarCantidadStock"
                    id={`cambiarCantidadStock${almacen.codalmacen}`}
                    value={almacen.cantidad}
                    onClick={event => event.target.select()}
                    variant="standard"
                    onChange={e =>
                      dispatch({
                        type: "onCantidadStockChanged",
                        payload: {
                          value: parseInt(e.floatValue),
                          codalmacen: almacen.codalmacen,
                        },
                      })
                    }
                  />
                )}
                flexGrow={1}
                onKeyDown={handleKeyDownCantidad}
                onBlur={handleBlurCantidad}
              />
              <Column.Action
                id="suma"
                header="Suma"
                value={almacen => (
                  <Field.Int
                    name="sumarCantidad"
                    onClick={event => event.target.select()}
                    id={`sumarCantidad${almacen.codalmacen}`}
                    value={almacen.suma}
                  />
                )}
                flexGrow={1}
                onKeyDown={handleKeyDown}
                onBlur={handleBlurSumar}
              />
              <Column.Action
                id="detalle"
                header="Detalle"
                value={almacen => (
                  <Field.Text
                    name="cambiarDetalleUbicacion"
                    id={`cambiarDetalleUbicacion${almacen.codalmacen}`}
                    value={almacen.detalleubicacion}
                    onChange={e =>
                      dispatch({
                        type: "onDetalleUbicacionChanged",
                        payload: {
                          value: e.target.value,
                          codalmacen: almacen.codalmacen,
                        },
                      })
                    }
                  />
                )}
                flexGrow={1}
                onKeyDown={handleKeyDown}
              />
            </Table>
          </Box>
          <Grid container driection="row" justifyContent="flex-end">
            <Button
              id="volver"
              text="Volver"
              color="primary"
              variant="contained"
              startIcon={<Icon>arrow_back_outlined</Icon>}
            // onClick={() => callbackVolver({ stock })}
            />
          </Grid>
        </Box>

        {/** Dialogo añadir almacén */}
        <Dialog
          open={modalAddAlmacen}
          keepMounted
          onClose={() => dispatch({ type: "onCerrarAddAlmacenConfirm", payload: {} })}
          classes={{ paper: classes.paper20Auto }}
        >
          <DialogTitle>Añadir almacén</DialogTitle>
          <DialogContent>
            <QAlmacenesVbarba
              id="nuevoAlmacen.codalmacen"
              finca={miFinca.codfinca}
              disableClearable
              boxStyle={classes.referencia}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button id="addAlmacenConfirm" text="Confirmar" color="primary" variant="contained" />
          </DialogActions>
        </Dialog>

        <input
          id="hiddenAttachInputImage"
          type="file"
          style={{
            height: 0,
            visibility: "hidden",
          }}
          accept="image/*"
          onChange={e =>
            dispatch({
              type: "onImagenAdjuntada",
              payload: { files: Array.from(e.target.files) },
            })
          }
        />
      </Container>
    </Quimera.Template>
  );
}

export default Stock;
