import { Totales } from "@quimera-extension/base-area_clientes";
import {
  DocAgente,
  DocClienteYDir,
  DocFecha,
  LineaPedidoCliComp,
} from "@quimera-extension/base-ventas";
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
import Quimera, { getSchemas, useStateValue, useWidth, util } from "quimera";
import { useCallback, useEffect } from "react";

function PedidoCli({ callbackChanged, idPedido, initPedido, useStyles }) {
  const [
    {
      generandoAlbaran,
      generandoPedidoProv,
      lineas,
      logic,
      modalVistaEnviarDocumento,
      pedido,
      vistaDetalle,
    },
    dispatch,
  ] = useStateValue();
  const classes = useStyles();
  const width = useWidth();

  useEffect(() => {
    util.publishEvent(pedido.event, callbackChanged);
  }, [pedido.event.serial]);

  useEffect(() => {
    !!initPedido &&
      dispatch({
        type: "onInitPedido",
        payload: {
          initPedido,
        },
      });
    !initPedido &&
      !!idPedido &&
      dispatch({
        type: "onInitPedidoById",
        payload: {
          idPedido,
        },
      });
  }, [initPedido, idPedido]);

  // Necesario para que no salte el useEffect de onInit en cada render de LineaPedidoCliNueva
  const callbackNuevaLinea = useCallback(
    payload => dispatch({ type: "onLineaCreada", payload }),
    [dispatch],
  );

  const mobile = ["xs", "sm"].includes(width);
  const anchoDetalle = mobile ? 1 : 0.5;
  const schema = getSchemas().pedidos;
  const editable = logic.pedidoEditable(pedido.data);
  const editableGenerarPediProv = true;
  const editableDirFecha = false;
  const opcionesDocProp = {
    main: { tipo: "pedidoscli", textoBoton: "Enviar" },
  };

  if ((!initPedido && !idPedido) || initPedido?._status === "deleted") {
    return null;
  }

  if (idPedido && !pedido.data.idPedido) {
    return null;
  }

  return (
    <Quimera.Template id="PedidoDetalle">
      {pedido && (
        <QBox
          width={anchoDetalle}
          titulo={`Pedido ${pedido.data.codigo}`}
          botonesCabecera={[
            // { icon: "more_horiz", id: "mas", text: "Más" },
            { icon: "arrow_back", id: "atras", text: "Atrás" },
          ]}
          sideButtons={
            <>
              <QBoxButton
                id="deletePedido"
                title="Borrar pedido"
                icon="delete"
                disabled={!editable}
              />
              <QBoxButton
                id="generarPedidoProv"
                title="Generar pedido proveedor"
                icon={
                  !generandoPedidoProv ? (
                    "assignment_ind"
                  ) : (
                    <CircularProgress size={30} color="#2676e9" />
                  )
                }
                disabled={!editableGenerarPediProv}
              />
              <QBoxButton
                id="imprimirPedidoCli"
                title="Imprimir pedido"
                icon="receipt_long"
                disabled={false}
              />
              <QBoxButton
                id="generarAlbaran"
                title="Generar albaran"
                icon={
                  !generandoAlbaran ? (
                    "assignment_ind"
                  ) : (
                    <CircularProgress size={30} color="#2676e9" />
                  )
                }
                disabled={!editableGenerarPediProv}
              />
              <QBoxButton id="enviarEmail" title="Enviar por email" icon="email" />
              <QBoxButton id="albaranar" title="Albaranar" icon="shop" disabled={!editable} onClick={() => (window.location.href = `/ventas/albaranar-pedido/${pedido.data.idPedido}`)} />
            </>
          }
        >
          <QModelBox id="pedido.buffer" disabled={!editable || !editableDirFecha} schema={schema}>
            {vistaDetalle === "principal" ? (
              <Box>
                <DocClienteYDir />
                <QSection
                  title="Observaciones"
                  actionPrefix="pedidoBuffer"
                  // alwaysInactive={disabled}
                  saveDisabled={() => !schema.isValid(pedido.buffer)}
                  dynamicComp={() => (
                    <Field.Schema
                      id="pedido.buffer.observaciones"
                      schema={schema}
                      fullWidth
                      label=""
                    />
                  )}
                >
                  {pedido.buffer.observaciones ? (
                    <Typography variant="body1">{pedido.buffer.observaciones}</Typography>
                  ) : (
                    <Typography variant="body2">{"Indique aquí sus observaciones"}</Typography>
                  )}
                </QSection>
                {/* <DocDirCliente /> */}
                <Quimera.Block id="afterDireccion" />
                <Box display="flex" justifyContent="space-between">
                  <DocFecha />
                  <QSection
                    title="Fecha Salida"
                    actionPrefix="pedidoBuffer"
                    alwaysInactive={false}
                    dynamicComp={() => (
                      <Field.Schema
                        id={`pedido.buffer.fechaSalida`}
                        schema={schema}
                        label=""
                        fullWidth
                        autoFocus
                      />
                    )}
                    saveDisabled={() => !schema.isValid(pedido.buffer)}
                  >
                    <Box display="flex" alignItems="center">
                      <Box mr={1}>
                        <Icon color="action" fontSize="medium">
                          event
                        </Icon>
                      </Box>
                      <Typography variant="h5">
                        {util.formatDate(pedido.buffer.fechaSalida)}
                      </Typography>
                    </Box>
                  </QSection>
                  <QSection actionPrefix="totales" alwaysInactive>
                    <Totales
                      totales={[
                        { name: "Neto", value: pedido.buffer.neto },
                        { name: "Total IVA", value: pedido.buffer.totalIva },
                        { name: "Total", value: pedido.buffer.total },
                      ]}
                    />
                  </QSection>
                </Box>
                {editable && (
                  <Quimera.View
                    id="LineaPedidoCliNueva"
                    idPedido={pedido.data.idPedido}
                    inline
                    callbackGuardada={callbackNuevaLinea}
                  />
                )}
                <QListModel
                  data={lineas}
                  title="Líneas"
                  modelName="lineas"
                  ItemComponent={LineaPedidoCliComp}
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
        open={modalVistaEnviarDocumento}
        fullWidth
        maxWidth="md"
        fullScreen={width === "xs" || width === "sm"}
      >
        <DialogContent>
          <Quimera.View
            id="EnviarDocumentoEmail"
            opcionesDocProp={opcionesDocProp}
            idDocProp={pedido.data.idPedido}
            codClienteProp={pedido.data.codCliente}
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

export default PedidoCli;
