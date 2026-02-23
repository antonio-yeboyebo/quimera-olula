import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Field,
  QBox,
  QBoxButton,
  QListModel,
  QModelBox,
  QSection,
  Typography,
} from "@quimera/comps";
import { CircularProgress } from "@quimera/thirdparty";
import { Totales } from "@quimera-extension/base-area_clientes";
import { DocAgente, DocClienteYDir, DocFecha } from "@quimera-extension/base-ventas";
import Quimera, { getSchemas, useStateValue, useWidth, util } from "quimera";
import React, { useCallback, useEffect } from "react";

import { LineaAlbaranCliComp } from "../../comps";

function AlbaranCli({ callbackChanged, idAlbaran, initAlbaran, useStyles }) {
  const [
    {
      lineas,
      logic,
      albaran,
      vistaDetalle,
      modalFirmanteExterno,
      modalFirmaVisible,
      modalVistaEnviarAlbaran,
      albaranSeleccionado,
      generandoFactura,
    },
    dispatch,
  ] = useStateValue();
  const classes = useStyles();
  const width = useWidth();

  const opcionesDocProp = {
    main: { tipo: "albaranescli", textoBoton: "Enviar valorado" },
    secondary: { tipo: "albaranescli_no_valorado", textoBoton: "Enviar no valorado" },
  };

  useEffect(() => {
    util.publishEvent(albaran.event, callbackChanged);
  }, [albaran.event.serial]);

  useEffect(() => {
    !!initAlbaran &&
      dispatch({
        type: "onInitAlbaran",
        payload: {
          initAlbaran,
        },
      });
    !initAlbaran &&
      !!idAlbaran &&
      dispatch({
        type: "onInitAlbaranById",
        payload: {
          idAlbaran,
        },
      });
  }, [initAlbaran, idAlbaran]);

  // Necesario para que no salte el useEffect de onInit en cada render de LineaAlbaranCliNueva
  const callbackNuevaLinea = useCallback(
    payload => dispatch({ type: "onLineaCreada", payload }),
    [dispatch],
  );

  const mobile = ["xs", "sm"].includes(width);
  const anchoDetalle = mobile ? 1 : 0.5;
  const schema = getSchemas().albaranescli;
  const editable = logic.albaranEditable(albaran.data) && !albaran.buffer.firmado;
  const editableDirFecha = false;

  if ((!initAlbaran && !idAlbaran) || initAlbaran?._status === "deleted") {
    return null;
  }

  if (idAlbaran && !albaran.data.idAlbaran) {
    return null;
  }

  return (
    <Quimera.Template id="AlbaranDetalle">
      {albaran && (
        <QBox
          width={anchoDetalle}
          titulo={`Albaran ${albaran.data.codigo}`}
          botonesCabecera={[
            // { icon: "more_horiz", id: "mas", text: "Más" },
            { icon: "arrow_back", id: "atras", text: "Atrás" },
          ]}
          sideButtons={
            <>
              <QBoxButton
                id="deleteAlbaran"
                title="Borrar albaran"
                icon="delete"
                disabled={!editable}
              />
              <QBoxButton
                id="imprimirAlbaran"
                title="Imprimir albarán valorado"
                icon="receipt_long"
                disabled={false}
                onClick={() =>
                  dispatch({
                    type: "onImprimirAlbaranClicked",
                    payload: { tipo: "valorado" },
                  })
                }
              />
              <QBoxButton
                id="imprimirAlbaranNoValorado"
                title="Imprimir albarán no valorado"
                icon="receipt"
                disabled={false}
                onClick={() =>
                  dispatch({
                    type: "onImprimirAlbaranClicked",
                    payload: { tipo: "no_valorado" },
                  })
                }
              />
              <QBoxButton
                id="generarFactura"
                title="Generar factura"
                icon={
                  !generandoFactura ? (
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
          <QModelBox id="albaran.buffer" disabled={!editable || !editableDirFecha} schema={schema}>
            {vistaDetalle === "principal" ? (
              <Box>
                <DocClienteYDir />
                <QSection
                  title="Observaciones"
                  actionPrefix="albaranBuffer"
                  // alwaysInactive={disabled}
                  saveDisabled={() => !schema.isValid(albaran.buffer)}
                  dynamicComp={() => (
                    <Field.Schema
                      id="albaran.buffer.observaciones"
                      schema={schema}
                      fullWidth
                      label=""
                    />
                  )}
                >
                  {albaran.buffer.observaciones ? (
                    <Typography variant="body1">{albaran.buffer.observaciones}</Typography>
                  ) : (
                    <Typography variant="body2">{"Indique aquí sus observaciones"}</Typography>
                  )}
                </QSection>
                {albaran.buffer.firmado ? (
                  <QSection
                    title="Firmado por"
                    actionPrefix="albaranBuffer"
                    alwaysInactive={true}
                    saveDisabled={() => !schema.isValid(albaran.buffer)}
                    dynamicComp={() => (
                      <Field.Schema
                        id="albaran.buffer/firmadoPor"
                        schema={schema}
                        fullWidth
                        label=""
                      />
                    )}
                  >
                    <Typography variant="body1">{albaran.buffer.firmadoPor}</Typography>
                  </QSection>
                ) : (
                  <Box mt={2} style={{ display: "flex", justifyContent: "space-around" }}>
                    <Button
                      id="firmarAlbaran"
                      data={{ albaran }}
                      color="secondary"
                      variant="contained"
                      text={!albaran.buffer.firmado ? "Firmar" : "Firmado"}
                      disabled={albaran.buffer.firmado}
                    />
                    <Button
                      id="firmaExterna"
                      data={{ albaran }}
                      color={albaran.buffer?.estadoFirma !== "En espera" ? "secondary" : "primary"}
                      variant="contained"
                      text={
                        albaran.buffer?.estadoFirma !== "En espera"
                          ? "Enviar a puesto de firma"
                          : "Cancelar operación de firma externa"
                      }
                      disabled={albaran.buffer.firmado}
                      onClick={() =>
                        dispatch({
                          type:
                            albaran.buffer?.estadoFirma !== "En espera"
                              ? "onAbrirModalFirmaExternaClicked"
                              : "onCancelarFirmaExternaClicked",
                        })
                      }
                    />
                  </Box>
                )}

                <Dialog
                  open={modalFirmaVisible}
                  fullWidth
                  maxWidth="md"
                  fullScreen={width === "xs" || width === "sm"}
                >
                  <Quimera.View
                    id="FirmaAlbaran"
                    initAlbaran={albaranSeleccionado}
                    callbackCerrado={payload => dispatch({ type: "onCerrarFirmaAlbaran", payload })}
                  />
                </Dialog>
                {/* <DocDirCliente /> */}
                <Quimera.Block id="afterDireccion" />
                <Box display="flex" justifyContent="space-between">
                  <DocFecha />
                  <QSection actionPrefix="totales" alwaysInactive>
                    <Totales
                      totales={[
                        { name: "Neto", value: albaran.buffer.neto },
                        { name: "Total IVA", value: albaran.buffer.totalIva },
                        { name: "Total", value: albaran.buffer.total },
                      ]}
                    />
                  </QSection>
                </Box>
                {editable && (
                  <Quimera.View
                    id="LineaAlbaranCliNueva"
                    idAlbaran={albaran.data.idAlbaran}
                    inline
                    callbackGuardada={callbackNuevaLinea}
                  />
                )}
                <QListModel
                  data={lineas}
                  title="Líneas"
                  modelName="lineas"
                  ItemComponent={LineaAlbaranCliComp}
                  itemProps={{
                    variant: "section",
                  }}
                  disabled={!editable}
                />
                <Quimera.Block id="afterLineas" />
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
        open={modalVistaEnviarAlbaran}
        fullWidth
        maxWidth="md"
        fullScreen={width === "xs" || width === "sm"}
      >
        <DialogContent>
          <Quimera.View
            id="EnviarDocumentoEmail"
            opcionesDocProp={opcionesDocProp}
            idDocProp={albaran.data.idAlbaran}
            codClienteProp={albaran.data.codCliente}
            callbackCerradoProp={payload =>
              dispatch({ type: "onCancelEnviarEmailClicked", payload })
            }
            callbackEnviadoProp={payload => dispatch({ type: "onEmailEnviado", payload })}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalFirmanteExterno}
        fullWidth
        maxWidth="md"
        fullScreen={width === "xs" || width === "sm"}
      >
        <DialogContent>
          <Quimera.View
            id="EnviarAlbaranFirmaExterna"
            albaranProp={albaran.data}
            callbackCerradoProp={payload => dispatch({ type: "onCloseFirmaExterna", payload })}
            callbackCancelarEnvioProp={payload =>
              dispatch({ type: "onModalCancelarFirmaExternaClicked", payload })
            }
            callbackEnviadoProp={payload => dispatch({ type: "onEnviadoFirmaPuesto", payload })}
            callbackFirmadoProp={payload =>
              dispatch({ type: "onAlbaranFirmaPuestoFirmado", payload })
            }
          />
        </DialogContent>
      </Dialog>
    </Quimera.Template>
  );
}

export default AlbaranCli;
