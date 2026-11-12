import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { FactoryObj } from "@olula/lib/factory_ctx.tsx";
import { formatearMoneda, redondeaMoneda } from "@olula/lib/dominio.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { usePreferencia } from "@olula/lib/usePreferencia.ts";
import { useCallback, useContext, useEffect, useState } from "react";
import { VentaTpv } from "../diseño.ts";
import { postPago } from "../infraestructura.ts";
import {
  metaNuevoPagoEfectivo,
  nuevoPagoEfectivoInicial,
} from "./pagar_en_efectivo.ts";
import { EuroDenominacion } from "#/tpv/comun/componentes/EuroDenominacion.tsx";
import { publicarEnVisor } from "#/tpv/visor/canal.ts";
import "./PagarEfectivoVentaTpv.css";

export const PagarEfectivoVentaTpv = ({
  publicar,
  venta,
}: {
  publicar: EmitirEvento;
  venta: VentaTpv;
}) => {
  const pendiente = redondeaMoneda(venta.total - venta.pagado, venta.divisa_id);

  const enviarEfectivoEntregado = (FactoryObj.app.TPV?.venta_enviarEfectivoEntregado as boolean | undefined) ?? false;

  const { modelo, uiProps, valido, set } = useModelo(
    metaNuevoPagoEfectivo,
    nuevoPagoEfectivoInicial
  );

  const [pagando, setPagando] = useState(false);

  const [mostrarDenominaciones, setMostrarDenominaciones] = usePreferencia(
    "tpv.pagar-efectivo.mostrar-denominaciones",
    true
  );

  const { intentar } = useContext(ContextoError);

  // El cliente ve en el visor lo que ha entregado y su cambio.
  const entregado = Number(modelo.importe) || 0;
  useEffect(() => {
    publicarEnVisor({ tipo: "entregado", importe: entregado });
  }, [entregado]);

  const pagar = useCallback(
    async () => {
      const idPago = await intentar(() =>
        postPago(venta.id, {
          importe: Math.min(pendiente, modelo.importe),
          formaPago: "EFECTIVO",
          // Solo al cobrar: en devoluciones no hay entregado ni cambio
          entregado: enviarEfectivoEntregado && pendiente > 0 ? Number(modelo.importe) : undefined,
        })
      );
      setPagando(true);
      publicar("pago_en_efectivo_hecho", idPago);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modelo, publicar, venta.id]
  );

  const cancelar = useCallback(() => {
    if (!pagando) publicar("pago_cancelado");
  }, [pagando, publicar]);

  const sumar = (valor: number) => {
    return () => {
      setImporte(redondeaMoneda(Number(modelo.importe) + valor, venta.divisa_id));
    };
  };

  const setImporte = (v: number) => {
    set({
      ...modelo,
      importe: v,
    });
  };

  const limpiar = () => {
    setImporte(0);
  };

  const cambio = redondeaMoneda(
    modelo.importe - pendiente > 0 ? modelo.importe - pendiente : 0,
    venta.divisa_id
  );

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo="Pagar en efectivo"
      onCerrar={cancelar}
    >
      <div className="PagarEfectivoVentaTpv">
        <quimera-formulario>
          <div id="pendiente">
            {`A pagar: ${formatearMoneda(pendiente, venta.divisa_id)}. Cambio: ${formatearMoneda(cambio, venta.divisa_id)}`}
          </div>

          <QInput label="Importe" {...uiProps("importe")} />
        </quimera-formulario>

        <div className="botones maestro-botones ">
          <QBoton onClick={limpiar}>Limpiar</QBoton>
          <QBoton onClick={() => setMostrarDenominaciones(!mostrarDenominaciones)}>
            {mostrarDenominaciones ? "Ocultar" : "Mostrar billetes"}
          </QBoton>
        </div>

        {mostrarDenominaciones && (
          <>
            <div className="botones maestro-botones denominaciones">
              <QBoton onClick={sumar(0.01)}><EuroDenominacion valor={0.01} /></QBoton>
              <QBoton onClick={sumar(0.02)}><EuroDenominacion valor={0.02} /></QBoton>
              <QBoton onClick={sumar(0.05)}><EuroDenominacion valor={0.05} /></QBoton>
              <QBoton onClick={sumar(0.1)}><EuroDenominacion valor={0.1} /></QBoton>
              <QBoton onClick={sumar(0.2)}><EuroDenominacion valor={0.2} /></QBoton>
              <QBoton onClick={sumar(0.5)}><EuroDenominacion valor={0.5} /></QBoton>
              <QBoton onClick={sumar(1)}><EuroDenominacion valor={1} /></QBoton>
              <QBoton onClick={sumar(2)}><EuroDenominacion valor={2} /></QBoton>
            </div>

            <div className="botones maestro-botones denominaciones">
              <QBoton onClick={sumar(5)}><EuroDenominacion valor={5} /></QBoton>
              <QBoton onClick={sumar(10)}><EuroDenominacion valor={10} /></QBoton>
              <QBoton onClick={sumar(20)}><EuroDenominacion valor={20} /></QBoton>
              <QBoton onClick={sumar(50)}><EuroDenominacion valor={50} /></QBoton>
              <QBoton onClick={sumar(100)}><EuroDenominacion valor={100} /></QBoton>
              <QBoton onClick={sumar(200)}><EuroDenominacion valor={200} /></QBoton>
              <QBoton onClick={sumar(500)}><EuroDenominacion valor={500} /></QBoton>
            </div>
          </>
        )}

        <div className="botones maestro-botones ">
          <QBoton onClick={pagar} deshabilitado={!valido}>
            Pagar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
