import { Grid, Icon, QSection } from "@quimera/comps";
import { CircularProgress } from "@quimera/thirdparty";
import { DirCliente } from "@quimera-extension/base-ventas";
import Quimera, { getSchemas, PropValidation, useStateValue, util } from "quimera";
import React, { useEffect } from "react";

import { Cliente } from "../../comps";

function PedidosCliNuevo({ callbackGuardado, useStyles, ...props }) {
  const [{ pedido, savingPedido }, dispatch] = useStateValue();
  const schema = getSchemas().pedidoCliNuevo;
  // const classes = useStyles()

  useEffect(() => {
    dispatch({
      type: "onInit",
      payload: {
        callbackPedidoChanged: callbackGuardado,
        ...props,
      },
    });
  }, [callbackGuardado]);

  useEffect(() => {
    util.publishEvent(pedido.event, callbackGuardado);
  }, [pedido.event.serial]);

  return (
    <Quimera.Template id="PedidosCliNuevo">
      <QSection
        actionPrefix="nuevoPedido"
        alwaysActive
        dynamicComp={() => (
          <Grid container direction="column" spacing={2}>
            <Grid item xs={12}>
              <Cliente
                id="pedido.buffer/codCliente"
                label={`Cliente ${pedido.buffer.codCliente ?? ""}`}
                fullWidth
                async
                autoFocus
              />
            </Grid>
            <Grid item xs={12} style={{ visibility: "hidden", height: "0px" }}>
              <DirCliente
                id="pedido.buffer/codDir"
                codCliente={pedido.buffer.codCliente}
                label="Dirección"
                disabled
                fullWidth
              />
            </Grid>
          </Grid>
        )}
        saveDisabled={() => !schema.isValid(pedido.buffer)}
        save={{
          text: !savingPedido ? "Guardar" : <CircularProgress size={20} />,
          icon: !savingPedido ? <Icon>save_alt</Icon> : <></>,
        }}
      ></QSection>
    </Quimera.Template>
  );
}

export default PedidosCliNuevo;
