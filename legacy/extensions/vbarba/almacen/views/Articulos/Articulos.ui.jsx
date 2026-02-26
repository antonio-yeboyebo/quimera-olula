import {
  Box,
  Column,
  Container,
  Grid,
  Icon,
  IconButton,
  QMasterDetail,
  Table,
  Typography,
} from "@quimera/comps";
import { LinearProgress } from "@quimera/thirdparty";
import Quimera, { PropValidation, useStateValue, util } from "quimera";
import { useCallback, useEffect } from "react";

import { QArticuloVbarba } from "../../comps";

function Articulos({ useStyles, referenciaProp }) {
  const [{ estadoVista, articulos, lectura }, dispatch] = useStateValue();
  const classes = useStyles();

  useEffect(() => {
    util.getSetting("appDispatch")({
      type: "setNombrePaginaActual",
      payload: { nombre: `Artículo${referenciaProp ? "" : "s"}` },
    });

    return () =>
      util.getSetting("appDispatch")({ type: "setNombrePaginaActual", payload: { nombre: "" } });
  }, [dispatch, referenciaProp]);

  useEffect(() => {
    dispatch({
      type: "onInit",
    });
  }, [dispatch]);

  useEffect(() => {
    dispatch({
      type: "onIdArticulosProp",
      payload: { id: referenciaProp },
    });
  }, [referenciaProp]);

  const callbackArticuloCambiado = useCallback(
    payload => dispatch({ type: "onArticulosItemChanged", payload }),
    [],
  );

  const handleTextoFiltro = event => {
    event.stopPropagation();
    const value = event.target.value;
    const filtro = {
      or: [
        ["descripcion", "like", value],
        ["referencia", "like", value],
        ["codbarras", "like", value],
      ],
    };
    dispatch({ type: "onLecturaChanged", payload: { value } });
    if (event.keyCode === 13) {
      dispatch({ type: "onFiltroChanged", payload: { value, filtro } });
    }
  };

  return (
    <Quimera.Template id="Articulos">
      <QMasterDetail
        variant="fullscreen"
        MasterComponent={
          <Container>
            <Box mx={1} my={1}>
              <Grid container driection="row" alignItems="center" justifyContent="space-between">
                <Grid item sx={{
                  flex: '0 0 33.333%',
                  maxWidth: '33.333%',
                  width: '33.333%',
                  '@media (max-width: 900px)': {
                    flex: '0 0 100%',
                    maxWidth: '100%',
                    width: '100%'
                  }
                }}>
                  <QArticuloVbarba
                    id="referencia"
                    label={`Lectura${lectura ? ` (${lectura})` : ""}`}
                    boxStyle={classes.referencia}
                    onKeyDown={handleTextoFiltro}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>
            {estadoVista === "lanzando" && <LinearProgress />}
            {estadoVista === "lanzadoConResultados" && (
              <Box id="scrollableTablaArticulos">
                <Table
                  id="tdbArticulos"
                  idField="referencia"
                  data={Object.values(articulos.dict)}
                  clickMode="line"
                  loader={null}
                  orderColumn={articulos.order}
                  next={() => dispatch({ type: "onNextArticulos" })}
                  hasMore={articulos.page.next !== null}
                  scrollableTarget="scrollableTablaArticulos"
                >
                  <Column.Action
                    id="imagenButton"
                    value={linea => (
                      <IconButton
                        id="verImagen"
                        size="small"
                        tooltip={linea.tieneFoto ? "Ver imagen" : "No tiene imagen asociada"}
                        disabled={!linea.tieneFoto}
                        onClick={() =>
                          dispatch({
                            type: "onVerImagenClicked",
                            payload: { referencia: linea.referencia },
                          })
                        }
                      >
                        <Icon
                          size="small"
                          className={linea.tieneFoto ? classes.tieneFoto : classes.noTieneFoto}
                        >
                          image
                        </Icon>
                      </IconButton>
                    )}
                  />
                  <Column.Action
                    id="publicadoWebButton"
                    value={linea => (
                      <IconButton
                        id="actualizarPublicadoWeb"
                        size="small"
                        tooltip={linea.publicadoWeb ? "Publicado web" : "No publicado web"}
                        onClick={() =>
                          dispatch({
                            type: "onPublicadoWebClicked",
                            payload: { data: linea },
                          })
                        }
                      >
                        <Icon
                          className={linea.publicadoWeb ? classes.tieneFoto : classes.noTieneFoto}
                        >
                          {linea.publicadoWeb ? "visibility" : "visibility_off"}
                        </Icon>
                      </IconButton>
                    )}
                  />
                  <Column.Text
                    id="referencia"
                    header="Referencia"
                    order="referencia"
                    pl={2}
                    value={articulo => articulo.referencia}
                    flexGrow={1}
                    width={100}
                  />
                  <Column.Text
                    id="descripcion"
                    header="Descripcion"
                    order="descripcion"
                    pl={2}
                    value={articulo => articulo.descripcion}
                    flexGrow={2}
                    width={300}
                  />
                  <Column.Decimal
                    id="precioRef"
                    header="Precio referencia"
                    order="precioRef"
                    flexGrow={2}
                    decimals={2}
                  />
                  <Column.Date
                    id="fechaMod"
                    header="F. Mod"
                    order="fechaMod"
                    pl={2}
                    value={articulo => articulo.fechaMod}
                    flexGrow={2}
                    align="right"
                  />
                </Table>
              </Box>
            )}
            {estadoVista === "lanzadoSinResultados" && (
              <Box mt={4} display="flex" justifyContent="center">
                <Typography component="span" variant="h6">
                  No existen registros para este criterio de búsqueda
                </Typography>
              </Box>
            )}
          </Container>
        }
        DetailComponent={
          <Quimera.View
            id="Articulo"
            initArticulo={articulos.dict[articulos.current]}
            referencia={articulos.current}
            callbackChanged={callbackArticuloCambiado}
          />
        }
        current={articulos.current}
      />
    </Quimera.Template>
  );
}

export default Articulos;
