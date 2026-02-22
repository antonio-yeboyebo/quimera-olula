import { SelectorValores } from "@quimera-extension/base-almacen";
import { Box, Typography } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";
import { CircularProgress, Draggable, Droppable, Tooltip } from "@quimera/thirdparty";
import Quimera, { useStateValue, util } from "quimera";

const useStyles = makeStyles(theme => ({
  avatar: {
    backgroundColor: `${theme.palette.common.white}`,
    color: `${theme.palette.primary.dark}`,
    border: `2px solid ${theme.palette.primary.dark}`,
  },
  droppableContext: {
    "display": "flex",
    "flexWrap": "wrap",
    "&:hover": {
      cursor: "not-allowed",
    },
  },
  tarjetaConf: {
    margin: theme.spacing(1),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: `1px solid ${theme.palette.primary.dark}`,
  },
}));

function Configuraciones() {
  const [
    { arrayMedidasBrazo, arrayMedidasModulo, configuraciones, medidaModulo, medidaBrazo },
    dispatch,
  ] = useStateValue();
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
    <Quimera.Template id="Configuraciones">
      <Box width={1} display={"flex"} flexDirection={"column"} justifyContent={"flex-start"}>
        <Typography variant="h4" align="center">
          Módulos
        </Typography>
        <Box mx={1} display={"flex"} style={{ gap: "10px" }}>
          <SelectorValores
            id="filtroMedidasModulo"
            stateField="medidaModulo"
            label="Medida módulo"
            valores={arrayMedidasModulo}
            value={medidaModulo}
            arrayKeyValue
            fullWidth
          ></SelectorValores>
          <SelectorValores
            id="filtroMedidasBrazo"
            stateField="medidaBrazo"
            label="Medida brazo"
            valores={arrayMedidasBrazo}
            value={medidaBrazo}
            arrayKeyValue
            fullWidth
          ></SelectorValores>
        </Box>
        {configuraciones.loading ? (
          <Box width={1} display={"flex"} justifyContent={"center"}>
            <CircularProgress />
          </Box>
        ) : (
          <Droppable
            droppableId="configuraciones"
            isDropDisabled={true}
            isCombineEnabled={false}
            ignoreContainerClipping={false}
            key="configuraciones"
          >
            {(provided, snapshot) => {
              return (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={classes.droppableContext}
                >
                  {configuraciones?.idList?.map((conf, indice) => {
                    return (
                      <Draggable
                        key={`CONFIG_${configuraciones.dict[conf].idpreciobase}`}
                        draggableId={`CONFIG_ID_${configuraciones.dict[conf].idpreciobase}`}
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
                              {/* <Box
                                className={classes.tarjetaConf}
                                style={{
                                  height: `${altoCuadrado}px`,
                                  width: `${anchoCuadrado(configuraciones.dict[conf].cubicaje)}px`,
                                }}
                              >
                                <Tooltip
                                  title={`${configuraciones.dict[conf].confbase} ${configuraciones.dict[conf].descripcion
                                    } (${util.euros(configuraciones.dict[conf].precio)})`}
                                  placement="top"
                                  arrow
                                  TransitionProps={{ timeout: 600 }}
                                >
                                  <Box>{configuraciones.dict[conf].cubicaje}P</Box>
                                </Tooltip>
                                {provided.placeholder}
                              </Box> */}
                              <Box className={classes.tarjetaConf}>
                                <Tooltip
                                  title={`${configuraciones.dict[conf].confbase} ${configuraciones.dict[conf].descripcion
                                    } (${util.euros(configuraciones.dict[conf].precio)})`}
                                  placement="top"
                                  arrow
                                  TransitionProps={{ timeout: 600 }}
                                >
                                  <img
                                    src={`${baseImageSrc}/Iconos_MR/${soloConf(
                                      configuraciones.dict[conf].confbase,
                                    )}.jpg`}
                                    onError={({ currentTarget }) => {
                                      currentTarget.onerror = null; // prevents looping
                                      currentTarget.src = noImage;
                                    }}
                                    height="100px"
                                    alt={`${configuraciones.dict[conf].confbase} ${configuraciones.dict[conf].descripcion
                                      } (${util.euros(configuraciones.dict[conf].precio)})`}
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
        )}
      </Box>
    </Quimera.Template>
  );
}

export default Configuraciones;
