import {
  Box,
  Dialog,
  DialogContent,
  Field,
  Icon,
  QBox,
  QBoxButton,
  QListModel,
  QModelBox,
  QSection,
  Typography,
} from "@quimera/comps";
import { CircularProgress } from "@quimera/thirdparty";
import { Totales } from "@quimera-extension/base-area_clientes";
import { DocAgente, DocClienteYDir, LineaPresupuestoCli } from "@quimera-extension/base-ventas";
import Quimera, { getSchemas, useStateValue, useWidth, util } from "quimera";
import React, { useCallback, useEffect } from "react";

function PresupuestoCli({ callbackChanged, idPresupuesto, initPresupuesto, useStyles }) {
  const [
    { generandoPedido, lineas, logic, modalVistaEnviarDocumento, presupuesto, vistaDetalle },
    dispatch,
  ] = useStateValue();
  const classes = useStyles();
  const width = useWidth();

  useEffect(() => {
    util.publishEvent(presupuesto.event, callbackChanged);
  }, [presupuesto.event.serial]);

  useEffect(() => {
    !!initPresupuesto &&
      dispatch({
        type: "onInitPresupuesto",
        payload: {
          initPresupuesto,
        },
      });
    !initPresupuesto &&
      !!idPresupuesto &&
      dispatch({
        type: "onInitPresupuestoById",
        payload: {
          idPresupuesto,
        },
      });
  }, [initPresupuesto, idPresupuesto]);

  const callbackNuevaLinea = useCallback(
    payload => dispatch({ type: "onLineaCreada", payload }),
    [dispatch],
  );

  const mobile = ["xs", "sm"].includes(width);
  const anchoDetalle = mobile ? 1 : 0.5;
  const schema = getSchemas().presupuestosCli;
  const editable = logic.presupuestoEditable(presupuesto.data);
  const opcionesDocProp = {
    main: { tipo: "presupuestoscli", textoBoton: "Enviar" },
  };

  if ((!initPresupuesto && !idPresupuesto) || initPresupuesto?._status === "deleted") {
    return null;
  }

  if (idPresupuesto && !presupuesto.data.idPresupuesto) {
    return null;
  }

  return (
    <Quimera.Template id="PresupuestoDetalle">
      {presupuesto && (
        <QBox
          width={anchoDetalle}
          titulo={`Presupuesto ${presupuesto.data.codigo}`}
          botonesCabecera={[
            // { icon: "more_horiz", id: "mas", text: "Más" },
            { icon: "arrow_back", id: "atras", text: "Atrás" },
          ]}
          sideButtons={
            <>
              <QBoxButton
                id="deletePresupuesto"
                title="Borrar presupuesto"
                icon="delete"
                disabled={!editable}
              />
              <QBoxButton
                id="imprimirPresupuesto"
                title="Imprimir presupuesto"
                icon="receipt_long"
                disabled={false}
              />
              <QBoxButton
                id="generarPedido"
                title="Generar pedido"
                icon={
                  !generandoPedido ? (
                    "assignment_ind"
                  ) : (
                    <CircularProgress size={30} color="#2676e9" />
                  )
                }
                disabled={!editable}
              />
              <QBoxButton id="enviarEmail" title="Enviar por email" icon="email" />
            </>
          }
        >
          <QModelBox id="presupuesto.buffer" disabled={!editable} schema={schema}>
            {vistaDetalle === "principal" ? (
              <Box>
                <DocClienteYDir />
                <QSection
                  title="Observaciones"
                  actionPrefix="presupuestoBuffer"
                  // alwaysInactive={disabled}
                  saveDisabled={() => !schema.isValid(presupuesto.buffer)}
                  dynamicComp={() => (
                    <Field.Schema
                      id="presupuesto.buffer.observaciones"
                      schema={schema}
                      fullWidth
                      label=""
                    />
                  )}
                >
                  {presupuesto.buffer.observaciones ? (
                    <Typography variant="body1">{presupuesto.buffer.observaciones}</Typography>
                  ) : (
                    <Typography variant="body2">{"Indique aquí sus observaciones"}</Typography>
                  )}
                </QSection>
                {/* <DocDirCliente /> */}
                <Quimera.Block id="afterDireccion" />
                <Box display="flex" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <Box mr={1}>
                      <Icon color="action" fontSize="medium">
                        event
                      </Icon>
                    </Box>
                    <Typography variant="h5">
                      {util.formatDate(presupuesto.buffer.fecha)}
                    </Typography>
                  </Box>
                  <QSection
                    title="Fecha Salida"
                    actionPrefix="presupuestoBuffer"
                    alwaysInactive={false}
                    dynamicComp={() => (
                      <Field.Schema
                        id={`presupuesto.buffer.fechaSalida`}
                        schema={schema}
                        label=""
                        fullWidth
                        autoFocus
                      />
                    )}
                    saveDisabled={() => !schema.isValid(presupuesto.buffer)}
                  >
                    <Box display="flex" alignItems="center">
                      <Box mr={1}>
                        <Icon color="action" fontSize="medium">
                          event
                        </Icon>
                      </Box>
                      <Typography variant="h5">
                        {util.formatDate(presupuesto.buffer.fechaSalida)}
                      </Typography>
                    </Box>
                  </QSection>
                  <QSection actionPrefix="totales" alwaysInactive>
                    <Totales
                      totales={[
                        { name: "Neto", value: presupuesto.buffer.neto },
                        { name: "Total IVA", value: presupuesto.buffer.totalIva },
                        { name: "Total", value: presupuesto.buffer.total },
                      ]}
                    />
                  </QSection>
                </Box>
                {editable && (
                  <Quimera.View
                    id="LineaPresupuestoCliNueva"
                    idPresupuesto={presupuesto.data.idPresupuesto}
                    inline
                    callbackGuardada={callbackNuevaLinea}
                  />
                )}
                <QListModel
                  data={lineas}
                  title="Líneas"
                  modelName="lineas"
                  ItemComponent={LineaPresupuestoCli}
                  itemProps={{
                    variant: "section",
                  }}
                  disabled={!editable}
                />
              </Box>
            ) : (
              <Box width={1}>
                <DocAgente />
              </Box>
            )}
          </QModelBox>
        </QBox>
      )}
      <Dialog
        open={modalVistaEnviarDocumento}
        fullWidth
        maxWidth="md"
        fullScreen={width === "xs" || width === "sm"}
      >
        <DialogContent>
          <Quimera.View
            id="EnviarDocumentoEmail"
            opcionesDocProp={opcionesDocProp}
            idDocProp={presupuesto.data.idPresupuesto}
            codClienteProp={presupuesto.data.codCliente}
            callbackCerradoProp={payload =>
              dispatch({ type: "onCancelEnviarEmailClicked", payload })
            }
            callbackEnviadoProp={payload => dispatch({ type: "onEmailEnviado", payload })}
          />
        </DialogContent>
      </Dialog>
    </Quimera.Template>
  );
}

export default PresupuestoCli;
