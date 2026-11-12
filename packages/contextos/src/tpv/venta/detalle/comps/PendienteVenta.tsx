import { QBoton } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { pasarelaPagoActiva } from "#/tesoreria/cobro_online/dominio.ts";
import { VentaTpv } from "../../diseño.ts";
import "./PendienteVenta.css";

interface PendienteVentaProps {
  venta: VentaTpv;
  publicar: EmitirEvento,
}

export const PendienteVenta = ({
  venta,
  publicar,
}: PendienteVentaProps) => {

  const total = venta.total;
  const pagado = venta.pagado;
  const divisa = venta.divisa_id || "EUR";

  const pendiente = total - pagado;

  return (
    <div className="pendientes-venta">
      
      <div className="botones maestro-botones ">

        {pendiente < 0 && (
          <QBoton onClick={() => publicar("emision_de_vale_solicitada", venta)}>
            Emitir Vale
          </QBoton>
        )}

        {/* {pendiente > 0 && (
          <> */}
            <QBoton onClick={() => publicar("pago_efectivo_solicitado")}>
              P. Efectivo 
            </QBoton>

            <QBoton onClick={() => publicar("pago_tarjeta_solicitado")}>
              P. Tarjeta 
            </QBoton>

            <QBoton onClick={() => publicar("pago_vale_solicitado")}>
              P. Vale 
            </QBoton>

            {/* Cobro con QR (Stripe): solo para cobrar, no para devolver. */}
            {pasarelaPagoActiva() && pendiente > 0 && (
              <QBoton onClick={() => publicar("pago_qr_solicitado")}>
                P. QR
              </QBoton>
            )}
          {/* </> */}
        {/* )} */}

      </div>
      <div className="pendientes-venta-item">
        <label>Total:</label>
        <span>{formatearMoneda(total, divisa)}</span>
      </div>

      <div className="pendientes-venta-item">
        <label>Pagado:</label>
        <span>{formatearMoneda(pagado, divisa)}</span>
      </div>

      <div className="pendientes-venta-item">
        <label>Pendiente:</label>
        <span>{formatearMoneda(total - pagado, divisa)}</span>
      </div>
      
    </div>
  );
};
