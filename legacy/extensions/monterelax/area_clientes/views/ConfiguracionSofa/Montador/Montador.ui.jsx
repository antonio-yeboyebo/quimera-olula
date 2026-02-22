import { Box, Icon, IconButton } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";
import { Draggable, Droppable, Tooltip, Typography } from "@quimera/thirdparty";
import Quimera, { useStateValue, util } from "quimera";

const useStyles = makeStyles(theme => ({
  avatar: {
    backgroundColor: `${theme.palette.primary.dark}`,
  },
  droppableContext: {
    "display": "flex",
    "flexWrap": "wrap",
    "&:hover": {
      cursor: "not-allowed",
    },
  },
  tarjetaConf: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: `1px solid ${theme.palette.primary.dark}`,
  },
  botonBorrar: {
    "&:hover": {
      cursor: "pointer",
    },
  },
}));

function Montador() {
  const [{ misConfiguraciones, configuraciones }, dispatch] = useStateValue();
  const classes = useStyles();
  const altoCuadrado = 60;

  function anchoCuadrado(plazas) {
    return plazas * altoCuadrado;
  }

  const baseImageSrc = util.getEnvironment().getUrlImages();
  const noImage = `${baseImageSrc}/noimage.png`;

  function soloConf(confbase) {
    const index = confbase.indexOf("*");

    return confbase.substring(0, index);
  }

  return (
    <Quimera.Template id="Montador">
      <Box width={1} display={"flex"} flexDirection={"column"} justifyContent={"flex-start"}>
        <Typography variant="h4" align="center">
          Montador
        </Typography>

        <Droppable
          droppableId="montador"
          isDropDisabled={false}
          isCombineEnabled={false}
          ignoreContainerClipping={false}
          key="montador"
          direction="horizontal"
        >
          {(provided, snapshot) => {
            return (
              <Box
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={classes.droppableContext}
                style={{
                  opacity: snapshot.isDraggingOver ? 0.8 : 1,
                  background: snapshot.isDraggingOver ? "lightblue" : "inherit",
                  minHeight: "100px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {misConfiguraciones?.map((conf, indice) => {
                  return (
                    <Draggable
                      key={`MONTADOR_${indice}_${conf.idpreciobase}`}
                      draggableId={`MONTADOR_ID_${indice}_${conf.idpreciobase}`}
                      index={indice}
                      isDragDisabled={false}
                    >
                      {(provided, snapshot) => {
                        return (
                          <Box
                            {...provided.draggableProps}
                            ref={provided.innerRef}
                            {...provided.dragHandleProps}
                          >
                            <Box display={"flex"} justifyContent={"center"}>
                              <IconButton
                                id="eliminarConf"
                                tooltip="Eliminar"
                                onClick={() =>
                                  dispatch({
                                    type: `onEliminarConfiguracionClicked`,
                                    payload: { indice },
                                  })
                                }
                              >
                                <Icon>close</Icon>
                              </IconButton>
                            </Box>
                            {/* <Box
                              className={classes.tarjetaConf}
                              style={{
                                height: `${altoCuadrado}px`,
                                width: `${anchoCuadrado(conf.cubicaje)}px`,
                              }}
                            >
                              <Tooltip
                                title={`${conf.confbase} ${conf.descripcion} (${util.euros(
                                  conf.precio,
                                )})`}
                                placement="top"
                                arrow
                                TransitionProps={{ timeout: 600 }}
                              >
                                <Box>{conf.cubicaje}P</Box>
                              </Tooltip>
                              {provided.placeholder}
                            </Box> */}
                            <Box className={classes.tarjetaConf}>
                              <Tooltip
                                title={`${conf.confbase} ${conf.descripcion} (${util.euros(
                                  conf.precio,
                                )})`}
                                placement="top"
                                arrow
                                TransitionProps={{ timeout: 600 }}
                              >
                                <img
                                  src={`${baseImageSrc}/Iconos_MR/${soloConf(conf.confbase)}.jpg`}
                                  onError={({ currentTarget }) => {
                                    currentTarget.onerror = null; // prevents looping
                                    currentTarget.src = noImage;
                                  }}
                                  height="100px"
                                  alt={`${conf.confbase} ${conf.descripcion} (${util.euros(
                                    conf.precio,
                                  )})`}
                                  loading="lazy"
                                />
                              </Tooltip>
                              {provided.placeholder}
                            </Box>
                          </Box>
                        );
                      }}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </Box>
            );
          }}
        </Droppable>
      </Box>
    </Quimera.Template>
  );
}

export default Montador;
